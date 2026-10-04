/**
 * ============================================================================
 * TIC-TAC-TOE // INTELLIGENCE — CORE GAME ARCHITECTURE
 * Engineering Identity: Clean Engine Separation, Deterministic Analysis,
 * Minimax AI, Procedural Audio, and Accessible Interaction.
 * ============================================================================
 */

'use strict';

/* ============================================================================
   1. CONSTANTS & CONFIGURATION
   ============================================================================ */
const CONFIG = {
    BOARD_SIZE: 9,
    WINNING_COMBINATIONS: [
        [0, 1, 2], // Row 0
        [3, 4, 5], // Row 1
        [6, 7, 8], // Row 2
        [0, 3, 6], // Col 0
        [1, 4, 7], // Col 1
        [2, 5, 8], // Col 2
        [0, 4, 8], // Diag Main
        [2, 4, 6]  // Diag Anti
    ],
    CELL_NAMES: [
        'Top-Left (R1·C1)',
        'Top-Center (R1·C2)',
        'Top-Right (R1·C3)',
        'Middle-Left (R2·C1)',
        'Center (R2·C2)',
        'Middle-Right (R2·C3)',
        'Bottom-Left (R3·C1)',
        'Bottom-Center (R3·C2)',
        'Bottom-Right (R3·C3)'
    ],
    STORAGE_KEYS: {
        STATS: 'ttt_intel_lifetime_stats_v2',
        MATCH_LOGS: 'ttt_intel_match_logs_v2',
        SETTINGS: 'ttt_intel_settings_v2'
    },
    AI_DELAYS: {
        easy: 280,
        medium: 380,
        hard: 450
    }
};

/* ============================================================================
   2. PROCEDURAL AUDIO SYSTEM (Web Audio API)
   ============================================================================ */
class SoundFX {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setEnabled(val) {
        this.enabled = Boolean(val);
    }

    playMove(isX = true) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        // X gets a crisp high chime (520Hz -> 680Hz), O gets a warm resonant tone (380Hz -> 480Hz)
        const startFreq = isX ? 520 : 380;
        const endFreq = isX ? 680 : 480;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.13);
    }

    playAiMove() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(640, now + 0.06);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.15);
    }

    playInvalid() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.09);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.11);
    }

    playVictory() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = now + idx * 0.08;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.12, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.3);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(noteStart);
            osc.stop(noteStart + 0.32);
        });
    }

    playDraw() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.linearRampToValueAtTime(260, now + 0.3);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.36);
    }

    playUndo() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);

        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.11);
    }

    playClick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
    }
}

/* ============================================================================
   3. PERSISTENCE & STORAGE MANAGER
   ============================================================================ */
class StorageManager {
    constructor() {
        this.isLocalStorageAvailable = this.checkAvailability();
        this.memoryStore = {};
    }

    checkAvailability() {
        try {
            const testKey = '__ttt_storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    get(key, defaultValue) {
        if (this.isLocalStorageAvailable) {
            try {
                const item = localStorage.getItem(key);
                return item ? JSON.parse(item) : defaultValue;
            } catch (e) {
                return defaultValue;
            }
        }
        return this.memoryStore[key] !== undefined ? this.memoryStore[key] : defaultValue;
    }

    set(key, value) {
        if (this.isLocalStorageAvailable) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                this.memoryStore[key] = value;
            }
        } else {
            this.memoryStore[key] = value;
        }
    }

    getStats() {
        return this.get(CONFIG.STORAGE_KEYS.STATS, {
            gamesPlayed: 0,
            wins: 0,
            losses: 0,
            draws: 0,
            currentStreak: 0,
            bestStreak: 0,
            totalMoves: 0,
            totalDurationSec: 0
        });
    }

    saveStats(stats) {
        this.set(CONFIG.STORAGE_KEYS.STATS, stats);
    }

    getMatchLogs() {
        return this.get(CONFIG.STORAGE_KEYS.MATCH_LOGS, []);
    }

    addMatchLog(log) {
        const logs = this.getMatchLogs();
        logs.unshift(log);
        if (logs.length > 20) logs.pop(); // keep top 20
        this.set(CONFIG.STORAGE_KEYS.MATCH_LOGS, logs);
    }

    getSettings() {
        return this.get(CONFIG.STORAGE_KEYS.SETTINGS, {
            sound: true,
            mode: 'ai',
            difficulty: 'hard',
            playerSide: 'X'
        });
    }

    saveSettings(settings) {
        this.set(CONFIG.STORAGE_KEYS.SETTINGS, settings);
    }

    clearAll() {
        if (this.isLocalStorageAvailable) {
            try {
                localStorage.removeItem(CONFIG.STORAGE_KEYS.STATS);
                localStorage.removeItem(CONFIG.STORAGE_KEYS.MATCH_LOGS);
            } catch (e) {}
        }
        this.memoryStore = {};
    }
}

/* ============================================================================
   4. CORE GAME ENGINE (Pure Game State Machine)
   ============================================================================ */
class GameEngine {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.status = 'idle'; // 'idle' | 'in_progress' | 'won' | 'draw'
        this.winner = null;
        this.winningLine = null;
        this.history = []; // Array of snapshot objects
        this.gameMode = 'ai'; // 'ai' | 'pvp'
        this.aiDifficulty = 'hard'; // 'easy' | 'medium' | 'hard'
        this.playerSide = 'X'; // User's side in AI mode
        this.aiSide = 'O';
        this.startTime = null;
        this.endTime = null;
    }

    configure({ mode, difficulty, playerSide }) {
        if (mode) this.gameMode = mode;
        if (difficulty) this.aiDifficulty = difficulty;
        if (playerSide) {
            this.playerSide = playerSide;
            this.aiSide = playerSide === 'X' ? 'O' : 'X';
        }
    }

    startNewGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.status = 'in_progress';
        this.winner = null;
        this.winningLine = null;
        this.history = [];
        this.startTime = Date.now();
        this.endTime = null;
    }

    getValidMoves(boardState = this.board) {
        const moves = [];
        for (let i = 0; i < boardState.length; i++) {
            if (boardState[i] === '') moves.push(i);
        }
        return moves;
    }

    checkWinner(boardState = this.board) {
        for (const line of CONFIG.WINNING_COMBINATIONS) {
            const [a, b, c] = line;
            if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
                return { winner: boardState[a], line };
            }
        }
        return null;
    }

    isBoardFull(boardState = this.board) {
        return !boardState.includes('');
    }

    applyMove(index) {
        if (this.status !== 'in_progress' && this.status !== 'idle') {
            return { success: false, reason: 'Game over' };
        }
        if (index < 0 || index > 8 || this.board[index] !== '') {
            return { success: false, reason: 'Occupied or invalid cell' };
        }

        if (this.status === 'idle') {
            this.status = 'in_progress';
            this.startTime = Date.now();
        }

        const boardBefore = [...this.board];
        const movePlayer = this.currentPlayer;
        this.board[index] = movePlayer;

        // Record history snapshot before evaluating completion
        const snapshot = {
            moveNumber: this.history.length + 1,
            player: movePlayer,
            index,
            cellName: CONFIG.CELL_NAMES[index],
            boardBefore,
            boardAfter: [...this.board],
            timestamp: Date.now()
        };
        this.history.push(snapshot);

        // Check for victory or draw
        const winResult = this.checkWinner(this.board);
        if (winResult) {
            this.status = 'won';
            this.winner = winResult.winner;
            this.winningLine = winResult.line;
            this.endTime = Date.now();
            return { success: true, state: 'won', winner: this.winner, line: this.winningLine, snapshot };
        }

        if (this.isBoardFull(this.board)) {
            this.status = 'draw';
            this.winner = null;
            this.winningLine = null;
            this.endTime = Date.now();
            return { success: true, state: 'draw', snapshot };
        }

        // Advance player turn
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        return { success: true, state: 'in_progress', nextPlayer: this.currentPlayer, snapshot };
    }

    undoMove() {
        if (this.history.length === 0) return null;

        const lastSnapshot = this.history.pop();
        this.board = [...lastSnapshot.boardBefore];
        this.currentPlayer = lastSnapshot.player;
        this.status = 'in_progress';
        this.winner = null;
        this.winningLine = null;
        this.endTime = null;

        return {
            undoneSnapshot: lastSnapshot,
            restoredBoard: this.board,
            currentPlayer: this.currentPlayer,
            historyLength: this.history.length
        };
    }

    getGameDurationSec() {
        if (!this.startTime) return 0;
        const end = this.endTime || Date.now();
        return Math.max(1, Math.round((end - this.startTime) / 1000));
    }
}

/* ============================================================================
   5. AI ENGINE (Minimax, Tactical Medium, Heuristic Easy)
   ============================================================================ */
class AIEngine {
    constructor(engine) {
        this.engine = engine;
    }

    evaluateMoveTelemetry(board, aiSymbol, playerSymbol, difficulty) {
        const validMoves = this.engine.getValidMoves(board);
        const winMove = this.findImmediateWinningMove(board, aiSymbol);
        const threatMove = this.findImmediateWinningMove(board, playerSymbol);

        let threatDetected = threatMove !== null ? 'Immediate Threat' : 'None';
        let winOpportunity = winMove !== null ? 'Immediate Win' : 'None';

        let score = 0;
        if (winMove !== null) score = 1.0;
        else if (threatMove !== null) score = -0.5;

        return {
            candidates: validMoves.length,
            threat: threatDetected,
            winOpp: winOpportunity,
            eval: score.toFixed(2),
            rationale: this.generateTelemetryRationale(validMoves.length, winMove, threatMove, difficulty)
        };
    }

    generateTelemetryRationale(candidates, winMove, threatMove, difficulty) {
        if (winMove !== null) return 'Identified decisive victory vector. Executing match-winning move.';
        if (threatMove !== null) return 'Defensive counter-protocol engaged: blocking opponent winning line.';
        if (candidates === 9 || candidates === 8) return 'Analyzing board center and prime tactical corner positions.';
        if (difficulty === 'hard') return 'Minimax recursive depth search evaluating all future outcome trees.';
        if (difficulty === 'medium') return 'Heuristic tactical scanner searching for control advantage.';
        return 'Stochastic exploration with slight strategic bias.';
    }

    computeBestMove(board, aiSymbol, playerSymbol, difficulty) {
        const validMoves = this.engine.getValidMoves(board);
        if (validMoves.length === 0) return null;

        if (difficulty === 'easy') {
            return this.computeEasyMove(board, aiSymbol, validMoves);
        } else if (difficulty === 'medium') {
            return this.computeMediumMove(board, aiSymbol, playerSymbol, validMoves);
        } else {
            return this.computeHardMove(board, aiSymbol, playerSymbol, validMoves);
        }
    }

    computeEasyMove(board, aiSymbol, validMoves) {
        // 30% chance to check winning move, otherwise random selection
        if (Math.random() < 0.3) {
            const win = this.findImmediateWinningMove(board, aiSymbol);
            if (win !== null) return win;
        }
        const randomIndex = Math.floor(Math.random() * validMoves.length);
        return validMoves[randomIndex];
    }

    computeMediumMove(board, aiSymbol, playerSymbol, validMoves) {
        // 1. Take immediate win
        const win = this.findImmediateWinningMove(board, aiSymbol);
        if (win !== null) return win;

        // 2. Block immediate player threat
        const threat = this.findImmediateWinningMove(board, playerSymbol);
        if (threat !== null) return threat;

        // 3. Take Center if open
        if (board[4] === '') return 4;

        // 4. Take available corner
        const corners = [0, 2, 6, 8].filter(idx => board[idx] === '');
        if (corners.length > 0) {
            return corners[Math.floor(Math.random() * corners.length)];
        }

        // 5. Fallback random valid move
        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    computeHardMove(board, aiSymbol, playerSymbol, validMoves) {
        // Optimal Minimax search
        let bestScore = -Infinity;
        let bestMove = validMoves[0];

        // Center opening heuristic optimization
        if (validMoves.length === 9) return 4;
        if (validMoves.length === 8 && board[4] === '') return 4;

        for (const move of validMoves) {
            board[move] = aiSymbol;
            const score = this.minimax(board, 0, false, aiSymbol, playerSymbol, -Infinity, Infinity);
            board[move] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        return bestMove;
    }

    minimax(board, depth, isMaximizing, aiSymbol, playerSymbol, alpha, beta) {
        const winResult = this.engine.checkWinner(board);
        if (winResult) {
            return winResult.winner === aiSymbol ? 10 - depth : depth - 10;
        }
        if (this.engine.isBoardFull(board)) {
            return 0;
        }

        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = aiSymbol;
                    const evaluation = this.minimax(board, depth + 1, false, aiSymbol, playerSymbol, alpha, beta);
                    board[i] = '';
                    maxEval = Math.max(maxEval, evaluation);
                    alpha = Math.max(alpha, evaluation);
                    if (beta <= alpha) break; // Alpha-Beta Pruning
                }
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let i = 0; i < 9; i++) {
                if (board[i] === '') {
                    board[i] = playerSymbol;
                    const evaluation = this.minimax(board, depth + 1, true, aiSymbol, playerSymbol, alpha, beta);
                    board[i] = '';
                    minEval = Math.min(minEval, evaluation);
                    beta = Math.min(beta, evaluation);
                    if (beta <= alpha) break; // Alpha-Beta Pruning
                }
            }
            return minEval;
        }
    }

    findImmediateWinningMove(board, symbol) {
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = symbol;
                const win = this.engine.checkWinner(board);
                board[i] = '';
                if (win) return i;
            }
        }
        return null;
    }
}

/* ============================================================================
   6. DETERMINISTIC GAME ANALYZER & GAME REVIEW ENGINE (Signature Feature)
   ============================================================================ */
class GameAnalyzer {
    constructor(engine) {
        this.engine = engine;
    }

    analyzeMatch(history, winner, winningLine, durationSec, gameMode, playerSide) {
        if (!history || history.length === 0) return null;

        let threatsBlocked = 0;
        let missedWins = 0;
        let forksCreated = 0;
        let blunderCount = 0;

        const evaluatedSteps = [];

        // Replay history deterministically
        for (let i = 0; i < history.length; i++) {
            const step = history[i];
            const boardBefore = [...step.boardBefore];
            const player = step.player;
            const opponent = player === 'X' ? 'O' : 'X';
            const moveIdx = step.index;

            // 1. Did current player have an immediate winning move available?
            const availableWinIdx = this.findWinOnBoard(boardBefore, player);
            let missedWin = false;
            let achievedWin = false;

            if (availableWinIdx !== null) {
                if (availableWinIdx === moveIdx) {
                    achievedWin = true;
                } else {
                    missedWin = true;
                    missedWins++;
                }
            }

            // 2. Was there an opponent immediate winning threat that needed blocking?
            const opponentThreatIdx = this.findWinOnBoard(boardBefore, opponent);
            let threatBlocked = false;
            let threatIgnored = false;

            if (opponentThreatIdx !== null) {
                if (opponentThreatIdx === moveIdx) {
                    threatBlocked = true;
                    threatsBlocked++;
                } else {
                    threatIgnored = true;
                    blunderCount++;
                }
            }

            // 3. Did this move create a fork (2+ winning lines created)?
            const forkResult = this.detectForkCreation(boardBefore, player, moveIdx);
            if (forkResult) {
                forksCreated++;
            }

            // Tag and detail narrative for this step
            let tag = 'TACTICAL';
            let title = `Move ${step.moveNumber}: ${CONFIG.CELL_NAMES[moveIdx]}`;
            let explanation = `Player ${player} placed mark at ${CONFIG.CELL_NAMES[moveIdx]}.`;

            if (achievedWin) {
                tag = 'WINNING STRIKE';
                title = `🎯 Decisive Winning Move`;
                explanation = `Player ${player} connected 3 symbols on alignment [${winningLine ? winningLine.join(', ') : ''}], securing match victory.`;
            } else if (missedWin) {
                tag = 'MISSED WIN';
                title = `⚠️ Missed Winning Opportunity`;
                explanation = `A direct winning line was available at ${CONFIG.CELL_NAMES[availableWinIdx]}, but ${CONFIG.CELL_NAMES[moveIdx]} was selected instead.`;
            } else if (threatBlocked) {
                tag = 'THREAT BLOCKED';
                title = `🛡️ Critical Defense Block`;
                explanation = `Neutralized opponent's immediate winning vector at ${CONFIG.CELL_NAMES[opponentThreatIdx]}.`;
            } else if (threatIgnored) {
                tag = 'DEFENSIVE BLUNDER';
                title = `⚠️ Opponent Threat Unblocked`;
                explanation = `Opponent had an unblocked winning line at ${CONFIG.CELL_NAMES[opponentThreatIdx]}.`;
            } else if (forkResult) {
                tag = 'FORK CREATED';
                title = `⚡ Strategic Dual-Fork Attack`;
                explanation = `Created two simultaneous winning lines, putting the defending player into an inescapable loss trap.`;
            } else if (moveIdx === 4 && step.moveNumber <= 2) {
                tag = 'CENTER CONTROL';
                title = `👑 Center Grid Seizure`;
                explanation = `Acquired the high-value center tile (R2·C2), controlling 4 possible winning vectors.`;
            } else if ([0, 2, 6, 8].includes(moveIdx) && step.moveNumber <= 3) {
                tag = 'CORNER SETUP';
                title = `📐 Corner Position Anchor`;
                explanation = `Claimed a corner tile to prepare multi-directional diagonal and linear attack vectors.`;
            }

            evaluatedSteps.push({
                ...step,
                tag,
                title,
                explanation
            });
        }

        // Calculate Tactical Score (0 - 100)
        let score = 75; // base score
        if (winner) {
            score += 15;
        } else {
            score += 10; // good defense in draw
        }
        score += threatsBlocked * 8;
        score += forksCreated * 6;
        score -= missedWins * 20;
        score -= blunderCount * 18;
        score = Math.max(20, Math.min(100, score));

        // Score classification
        let grade = 'Solid Tactical Play';
        if (score >= 90) grade = 'Master Class Execution';
        else if (score >= 80) grade = 'High Tactical Efficiency';
        else if (score >= 60) grade = 'Balanced Play with Minor Inefficiencies';
        else grade = 'Suboptimal Line Selection';

        // Deterministic Narrative Summary: "WHAT HAPPENED?"
        const narrative = this.generateMatchNarrative(evaluatedSteps, winner, durationSec, score, gameMode, playerSide);

        return {
            totalMoves: history.length,
            durationSec,
            winner,
            winningLine,
            tacticalScore: score,
            tacticalGrade: grade,
            threatsBlocked,
            missedWins,
            forksCreated,
            evaluatedSteps,
            narrative
        };
    }

    findWinOnBoard(board, symbol) {
        for (let i = 0; i < 9; i++) {
            if (board[i] === '') {
                board[i] = symbol;
                for (const line of CONFIG.WINNING_COMBINATIONS) {
                    const [a, b, c] = line;
                    if (board[a] === symbol && board[b] === symbol && board[c] === symbol) {
                        board[i] = '';
                        return i;
                    }
                }
                board[i] = '';
            }
        }
        return null;
    }

    detectForkCreation(boardBefore, player, placedIdx) {
        const testBoard = [...boardBefore];
        testBoard[placedIdx] = player;

        let winningWays = 0;
        for (let i = 0; i < 9; i++) {
            if (testBoard[i] === '') {
                testBoard[i] = player;
                for (const line of CONFIG.WINNING_COMBINATIONS) {
                    const [a, b, c] = line;
                    if (testBoard[a] === player && testBoard[b] === player && testBoard[c] === player) {
                        winningWays++;
                        break;
                    }
                }
                testBoard[i] = '';
            }
        }
        return winningWays >= 2;
    }

    generateMatchNarrative(steps, winner, durationSec, score, gameMode, playerSide) {
        const paragraphs = [];

        if (winner) {
            const winStep = steps[steps.length - 1];
            paragraphs.push(
                `The match concluded on <strong class="narrative-highlight">Move ${steps.length}</strong> when Player ${winner} finalized a winning 3-symbol alignment at ${CONFIG.CELL_NAMES[winStep.index]}. Total elapsed match time was <strong>${durationSec}s</strong>.`
            );
        } else {
            paragraphs.push(
                `The match concluded in a <strong class="narrative-highlight">tactical stalemate (Draw)</strong> after all 9 grid coordinates were occupied with neither player conceding an unblocked alignment.`
            );
        }

        // Turning points
        const turningPoints = steps.filter(s => s.tag === 'FORK CREATED' || s.tag === 'THREAT BLOCKED' || s.tag === 'MISSED WIN');
        if (turningPoints.length > 0) {
            const firstTP = turningPoints[0];
            paragraphs.push(
                `A key turning phase emerged on <strong class="narrative-highlight">Move ${firstTP.moveNumber}</strong>: Player ${firstTP.player} executed <em>${firstTP.title}</em>, directly altering the strategic balance of the board.`
            );
        } else {
            paragraphs.push(
                `Both sides maintained standard territorial opening principles with rapid corner and center contestations.`
            );
        }

        if (score >= 85) {
            paragraphs.push(`Tactical efficiency was exemplary, characterized by immediate threat neutralization and zero conceded openings.`);
        } else if (score < 60) {
            paragraphs.push(`Tactical review indicates opportunities to improve threat recognition and prioritize immediate winning lines.`);
        }

        return paragraphs;
    }
}

/* ============================================================================
   7. ACCESSIBILITY & KEYBOARD CONTROLLER
   ============================================================================ */
class AccessibilityManager {
    constructor(uiController) {
        this.ui = uiController;
        this.focusedCellIndex = 0;
        this.initKeyboardListeners();
    }

    initKeyboardListeners() {
        document.addEventListener('keydown', (e) => {
            // Ignore keystrokes if focused in an input/textarea
            if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

            switch (e.key) {
                case 'Escape':
                    this.ui.closeAllModals();
                    break;
                case 'u':
                case 'U':
                    if (!this.ui.isModalOpen()) this.ui.handleUndo();
                    break;
                case 'r':
                case 'R':
                    if (!this.ui.isModalOpen()) this.ui.handleReset();
                    break;
                case 'm':
                case 'M':
                    this.ui.toggleSound();
                    break;
                case 's':
                case 'S':
                    this.ui.toggleStatsModal();
                    break;
                case '?':
                    this.ui.toggleHelpModal();
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    if (this.isBoardFocused()) {
                        e.preventDefault();
                        this.navigateGrid(e.key);
                    }
                    break;
            }
        });
    }

    isBoardFocused() {
        const active = document.activeElement;
        return active && (active.classList.contains('cell') || active.id === 'board');
    }

    navigateGrid(direction) {
        let current = this.focusedCellIndex;
        let row = Math.floor(current / 3);
        let col = current % 3;

        if (direction === 'ArrowUp') row = (row - 1 + 3) % 3;
        if (direction === 'ArrowDown') row = (row + 1) % 3;
        if (direction === 'ArrowLeft') col = (col - 1 + 3) % 3;
        if (direction === 'ArrowRight') col = (col + 1) % 3;

        this.focusedCellIndex = row * 3 + col;
        const cell = document.querySelector(`.cell[data-index="${this.focusedCellIndex}"]`);
        if (cell) cell.focus();
    }

    announce(message) {
        const el = document.getElementById('srAnnouncer');
        if (el) {
            el.textContent = '';
            setTimeout(() => {
                el.textContent = message;
            }, 50);
        }
    }
}

/* ============================================================================
   8. UI CONTROLLER & VIEW RENDERER
   ============================================================================ */
class UIController {
    constructor() {
        this.engine = new GameEngine();
        this.sound = new SoundFX();
        this.storage = new StorageManager();
        this.ai = new AIEngine(this.engine);
        this.analyzer = new GameAnalyzer(this.engine);
        this.a11y = new AccessibilityManager(this);

        this.timerInterval = null;
        this.sessionScores = { X: 0, O: 0, draws: 0 };
        this.currentStepInspectIndex = 0;
        this.lastAnalysis = null;
        this.isAiTurnProcessing = false;

        this.cacheDOM();
        this.bindEvents();
        this.loadInitialSettings();
        this.startMatch();
    }

    cacheDOM() {
        this.dom = {
            cells: Array.from(document.querySelectorAll('.cell')),
            statusBanner: document.getElementById('statusBanner'),
            statusDot: document.getElementById('statusDot'),
            statusPrimary: document.getElementById('statusPrimary'),
            statusSecondary: document.getElementById('statusSecondary'),
            aiTelemetry: document.getElementById('aiTelemetry'),
            telemetryCandidates: document.getElementById('telemetryCandidates'),
            telemetryThreat: document.getElementById('telemetryThreat'),
            telemetryEval: document.getElementById('telemetryEval'),
            telemetryRationale: document.getElementById('telemetryRationale'),
            strikeLine: document.getElementById('strikeLine'),
            board: document.getElementById('board'),
            undoBtn: document.getElementById('undoBtn'),
            resetBtn: document.getElementById('resetBtn'),
            reviewBtn: document.getElementById('reviewBtn'),
            timelineContainer: document.getElementById('timelineContainer'),
            timelineEmpty: document.getElementById('timelineEmpty'),
            timelineList: document.getElementById('timelineList'),
            matchTimer: document.getElementById('matchTimer'),
            totalMovesCount: document.getElementById('totalMovesCount'),
            firstAdvantageVal: document.getElementById('firstAdvantageVal'),
            soundToggleBtn: document.getElementById('soundToggleBtn'),
            soundIcon: document.getElementById('soundIcon'),
            statsModalBtn: document.getElementById('statsModalBtn'),
            helpModalBtn: document.getElementById('helpModalBtn'),
            modeBtns: Array.from(document.querySelectorAll('[data-mode]')),
            difficultyBtns: Array.from(document.querySelectorAll('[data-difficulty]')),
            sideBtns: Array.from(document.querySelectorAll('[data-side]')),
            difficultyGroup: document.getElementById('difficultyControlGroup'),
            sideGroup: document.getElementById('playerSideControlGroup'),
            difficultyHint: document.getElementById('difficultyHint'),
            scoreX: document.getElementById('scoreX'),
            scoreO: document.getElementById('scoreO'),
            scoreDraws: document.getElementById('scoreDraws'),
            scoreOLabel: document.getElementById('scoreOLabel'),
            quickResetStatsBtn: document.getElementById('quickResetStatsBtn'),
            // Modals
            reviewModal: document.getElementById('reviewModal'),
            closeReviewModalBtn: document.getElementById('closeReviewModalBtn'),
            reviewCloseActionBtn: document.getElementById('reviewCloseActionBtn'),
            reviewPlayAgainBtn: document.getElementById('reviewPlayAgainBtn'),
            reviewResultBadge: document.getElementById('reviewResultBadge'),
            reviewResultHeadline: document.getElementById('reviewResultHeadline'),
            reviewResultSubtext: document.getElementById('reviewResultSubtext'),
            scoreRingProgress: document.getElementById('scoreRingProgress'),
            tacticalScoreVal: document.getElementById('tacticalScoreVal'),
            tacticalScoreGrade: document.getElementById('tacticalScoreGrade'),
            revTotalMoves: document.getElementById('revTotalMoves'),
            revMoveEfficiency: document.getElementById('revMoveEfficiency'),
            revThreatsBlocked: document.getElementById('revThreatsBlocked'),
            revMissedWins: document.getElementById('revMissedWins'),
            revMissedDesc: document.getElementById('revMissedDesc'),
            reviewNarrativeBox: document.getElementById('reviewNarrativeBox'),
            miniCells: Array.from(document.querySelectorAll('.mini-cell')),
            stepPrevBtn: document.getElementById('stepPrevBtn'),
            stepNextBtn: document.getElementById('stepNextBtn'),
            stepCounter: document.getElementById('stepCounter'),
            stepBadge: document.getElementById('stepBadge'),
            stepTitle: document.getElementById('stepTitle'),
            stepExplanation: document.getElementById('stepExplanation'),
            statsModal: document.getElementById('statsModal'),
            closeStatsModalBtn: document.getElementById('closeStatsModalBtn'),
            statsModalOkBtn: document.getElementById('statsModalOkBtn'),
            clearAllStatsBtn: document.getElementById('clearAllStatsBtn'),
            ltGamesPlayed: document.getElementById('ltGamesPlayed'),
            ltWinRate: document.getElementById('ltWinRate'),
            ltWinsLosses: document.getElementById('ltWinsLosses'),
            ltCurrentStreak: document.getElementById('ltCurrentStreak'),
            ltBestStreak: document.getElementById('ltBestStreak'),
            ltAvgMoves: document.getElementById('ltAvgMoves'),
            matchHistoryTableBody: document.getElementById('matchHistoryTableBody'),
            helpModal: document.getElementById('helpModal'),
            closeHelpModalBtn: document.getElementById('closeHelpModalBtn'),
            helpModalOkBtn: document.getElementById('helpModalOkBtn')
        };
    }

    bindEvents() {
        // Board Cells
        this.dom.cells.forEach(cell => {
            cell.addEventListener('click', () => {
                const index = parseInt(cell.dataset.index, 10);
                this.handleCellClick(index);
            });
        });

        // Controls
        this.dom.undoBtn.addEventListener('click', () => this.handleUndo());
        this.dom.resetBtn.addEventListener('click', () => this.handleReset());
        this.dom.reviewBtn.addEventListener('click', () => this.openReviewModal());

        // Mode and Settings Selectors
        this.dom.modeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setMode(btn.dataset.mode);
                this.sound.playClick();
            });
        });

        this.dom.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setDifficulty(btn.dataset.difficulty);
                this.sound.playClick();
            });
        });

        this.dom.sideBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setPlayerSide(btn.dataset.side);
                this.sound.playClick();
            });
        });

        // Sound Toggle
        this.dom.soundToggleBtn.addEventListener('click', () => this.toggleSound());

        // Modal triggers
        this.dom.statsModalBtn.addEventListener('click', () => this.toggleStatsModal());
        this.dom.helpModalBtn.addEventListener('click', () => this.toggleHelpModal());
        this.dom.quickResetStatsBtn.addEventListener('click', () => this.resetSessionScores());

        // Modal Closers
        this.dom.closeReviewModalBtn.addEventListener('click', () => this.closeReviewModal());
        this.dom.reviewCloseActionBtn.addEventListener('click', () => this.closeReviewModal());
        this.dom.reviewPlayAgainBtn.addEventListener('click', () => {
            this.closeReviewModal();
            this.startMatch();
        });

        this.dom.closeStatsModalBtn.addEventListener('click', () => this.closeStatsModal());
        this.dom.statsModalOkBtn.addEventListener('click', () => this.closeStatsModal());
        this.dom.clearAllStatsBtn.addEventListener('click', () => this.clearAllLifetimeStats());

        this.dom.closeHelpModalBtn.addEventListener('click', () => this.closeHelpModal());
        this.dom.helpModalOkBtn.addEventListener('click', () => this.closeHelpModal());

        // Review Stepper Buttons
        this.dom.stepPrevBtn.addEventListener('click', () => this.stepReview(-1));
        this.dom.stepNextBtn.addEventListener('click', () => this.stepReview(1));
    }

    loadInitialSettings() {
        const settings = this.storage.getSettings();
        this.sound.setEnabled(settings.sound);
        this.updateSoundBtnUI(settings.sound);
        this.engine.configure({
            mode: settings.mode,
            difficulty: settings.difficulty,
            playerSide: settings.playerSide
        });

        this.updateSelectorUI(this.dom.modeBtns, settings.mode, 'mode');
        this.updateSelectorUI(this.dom.difficultyBtns, settings.difficulty, 'difficulty');
        this.updateSelectorUI(this.dom.sideBtns, settings.playerSide, 'side');
        this.updateModeVisibility(settings.mode);
        this.updateDifficultyHint(settings.difficulty);
    }

    updateSelectorUI(buttons, activeValue, dataKey) {
        buttons.forEach(btn => {
            const isActive = btn.dataset[dataKey] === activeValue;
            btn.classList.toggle('active', isActive);
            btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
        });
    }

    updateModeVisibility(mode) {
        const isAI = mode === 'ai';
        this.dom.difficultyGroup.style.display = isAI ? 'flex' : 'none';
        this.dom.sideGroup.style.display = isAI ? 'flex' : 'none';
        this.dom.aiTelemetry.style.display = isAI ? 'flex' : 'none';
        this.dom.scoreOLabel.textContent = isAI ? `AI (${this.engine.aiSide})` : 'PLAYER O';
    }

    updateDifficultyHint(diff) {
        const hints = {
            easy: 'Probabilistic exploration with deliberate human-like variance.',
            medium: 'Tactical lookahead: snatches immediate wins and blocks incoming lines.',
            hard: 'Unbeatable Minimax game-tree search with optimal evaluation.'
        };
        this.dom.difficultyHint.textContent = hints[diff] || '';
    }

    startMatch() {
        if (this.timerInterval) clearInterval(this.timerInterval);
        this.isAiTurnProcessing = false;
        this.engine.startNewGame();
        this.renderBoard();
        this.clearWinningStrike();
        this.dom.undoBtn.disabled = true;
        this.dom.reviewBtn.style.display = 'none';
        this.dom.timelineList.innerHTML = '';
        this.dom.timelineEmpty.style.display = 'flex';
        this.dom.matchTimer.textContent = '00:00';
        this.dom.totalMovesCount.textContent = '0 / 9';
        this.dom.firstAdvantageVal.textContent = `${this.engine.playerSide === 'X' ? 'Player' : 'Opponent'} X (+1)`;

        this.startTimer();
        this.updateStatusBanner();
        this.updateAiTelemetry();
        this.a11y.announce('New game started. Player X to make the opening move.');

        // If AI is 'X' (player chose 'O'), trigger AI opening move immediately
        if (this.engine.gameMode === 'ai' && this.engine.aiSide === 'X') {
            this.triggerAiMove();
        }
    }

    startTimer() {
        const start = Date.now();
        this.timerInterval = setInterval(() => {
            if (this.engine.status === 'in_progress') {
                const elapsed = Math.floor((Date.now() - start) / 1000);
                const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
                const secs = String(elapsed % 60).padStart(2, '0');
                this.dom.matchTimer.textContent = `${mins}:${secs}`;
            }
        }, 1000);
    }

    handleCellClick(index) {
        if (this.isAiTurnProcessing) return;
        if (this.engine.status === 'won' || this.engine.status === 'draw') return;

        // In AI mode, if it's currently AI's turn, ignore user clicks
        if (this.engine.gameMode === 'ai' && this.engine.currentPlayer === this.engine.aiSide) {
            return;
        }

        if (this.engine.board[index] !== '') {
            this.sound.playInvalid();
            return;
        }

        const moveResult = this.engine.applyMove(index);
        if (!moveResult.success) {
            this.sound.playInvalid();
            return;
        }

        this.sound.playMove(moveResult.snapshot.player === 'X');
        this.onMoveExecuted(moveResult);
    }

    onMoveExecuted(result) {
        this.renderBoard();
        this.appendTimelineItem(result.snapshot);
        this.dom.undoBtn.disabled = this.engine.history.length === 0;
        this.dom.totalMovesCount.textContent = `${this.engine.history.length} / 9`;

        if (result.state === 'won') {
            this.handleGameWon(result.winner, result.line);
        } else if (result.state === 'draw') {
            this.handleGameDraw();
        } else {
            this.updateStatusBanner();
            this.updateAiTelemetry();
            // Trigger AI if it's AI mode and current turn is AI's side
            if (this.engine.gameMode === 'ai' && this.engine.currentPlayer === this.engine.aiSide) {
                this.triggerAiMove();
            }
        }
    }

    triggerAiMove() {
        this.isAiTurnProcessing = true;
        this.dom.statusDot.className = 'status-indicator-dot thinking';
        this.dom.statusPrimary.textContent = `AI (${this.engine.aiSide}) Computing Decision...`;
        this.dom.statusSecondary.textContent = 'Executing neural game-tree traversal';

        const delay = CONFIG.AI_DELAYS[this.engine.aiDifficulty] || 350;

        setTimeout(() => {
            if (this.engine.status !== 'in_progress') {
                this.isAiTurnProcessing = false;
                return;
            }

            const bestMove = this.ai.computeBestMove(
                this.engine.board,
                this.engine.aiSide,
                this.engine.playerSide,
                this.engine.aiDifficulty
            );

            this.isAiTurnProcessing = false;

            if (bestMove !== null && this.engine.board[bestMove] === '') {
                const moveResult = this.engine.applyMove(bestMove);
                if (moveResult.success) {
                    this.sound.playAiMove();
                    this.onMoveExecuted(moveResult);
                }
            }
        }, delay);
    }

    handleGameWon(winner, line) {
        clearInterval(this.timerInterval);
        this.sound.playVictory();
        this.drawWinningStrike(line);
        this.highlightWinningCells(line);

        const duration = this.engine.getGameDurationSec();
        const isPlayerWin = this.engine.gameMode === 'ai' ? winner === this.engine.playerSide : true;

        this.dom.statusDot.className = 'status-indicator-dot win';
        this.dom.statusPrimary.textContent = `Player ${winner} Victorious!`;
        this.dom.statusSecondary.textContent = `Winning vector connected across alignment [${line.map(i => i + 1).join('·')}]`;

        this.dom.reviewBtn.style.display = 'inline-flex';
        this.a11y.announce(`Game over. Player ${winner} wins.`);

        // Record scores & stats
        if (winner === 'X') this.sessionScores.X++;
        else this.sessionScores.O++;
        this.updateSessionScoreboard();

        this.lastAnalysis = this.analyzer.analyzeMatch(
            this.engine.history,
            winner,
            line,
            duration,
            this.engine.gameMode,
            this.engine.playerSide
        );

        this.recordMatchStats(winner, duration, this.lastAnalysis.tacticalScore);
    }

    handleGameDraw() {
        clearInterval(this.timerInterval);
        this.sound.playDraw();

        const duration = this.engine.getGameDurationSec();
        this.dom.statusDot.className = 'status-indicator-dot';
        this.dom.statusPrimary.textContent = `Tactical Stalemate (Draw)`;
        this.dom.statusSecondary.textContent = 'All 9 coordinates occupied with zero conceded winning vectors';

        this.dom.reviewBtn.style.display = 'inline-flex';
        this.a11y.announce('Game ended in a draw.');

        this.sessionScores.draws++;
        this.updateSessionScoreboard();

        this.lastAnalysis = this.analyzer.analyzeMatch(
            this.engine.history,
            null,
            null,
            duration,
            this.engine.gameMode,
            this.engine.playerSide
        );

        this.recordMatchStats(null, duration, this.lastAnalysis.tacticalScore);
    }

    handleUndo() {
        if (this.isAiTurnProcessing || this.engine.history.length === 0) return;

        this.sound.playUndo();
        this.clearWinningStrike();

        // In AI mode against AI: undo two moves (player + AI) or one if AI hasn't moved yet
        if (this.engine.gameMode === 'ai') {
            if (this.engine.currentPlayer === this.engine.playerSide && this.engine.history.length >= 2) {
                this.engine.undoMove();
                this.engine.undoMove();
            } else {
                this.engine.undoMove();
            }
        } else {
            this.engine.undoMove();
        }

        this.renderBoard();
        this.rebuildTimeline();
        this.dom.undoBtn.disabled = this.engine.history.length === 0;
        this.dom.totalMovesCount.textContent = `${this.engine.history.length} / 9`;
        this.dom.reviewBtn.style.display = 'none';

        if (this.engine.status === 'in_progress') {
            this.updateStatusBanner();
            this.updateAiTelemetry();
        }

        this.a11y.announce('Last move undone. State reverted.');
    }

    handleReset() {
        this.sound.playClick();
        this.startMatch();
    }

    setMode(mode) {
        if (this.engine.gameMode === mode) return;
        this.engine.configure({ mode });
        this.storage.saveSettings({
            sound: this.sound.enabled,
            mode,
            difficulty: this.engine.aiDifficulty,
            playerSide: this.engine.playerSide
        });
        this.updateSelectorUI(this.dom.modeBtns, mode, 'mode');
        this.updateModeVisibility(mode);
        this.startMatch();
    }

    setDifficulty(difficulty) {
        if (this.engine.aiDifficulty === difficulty) return;
        this.engine.configure({ difficulty });
        this.storage.saveSettings({
            sound: this.sound.enabled,
            mode: this.engine.gameMode,
            difficulty,
            playerSide: this.engine.playerSide
        });
        this.updateSelectorUI(this.dom.difficultyBtns, difficulty, 'difficulty');
        this.updateDifficultyHint(difficulty);
        this.startMatch();
    }

    setPlayerSide(side) {
        if (this.engine.playerSide === side) return;
        this.engine.configure({ playerSide: side });
        this.storage.saveSettings({
            sound: this.sound.enabled,
            mode: this.engine.gameMode,
            difficulty: this.engine.aiDifficulty,
            playerSide: side
        });
        this.updateSelectorUI(this.dom.sideBtns, side, 'side');
        this.dom.scoreOLabel.textContent = `AI (${this.engine.aiSide})`;
        this.startMatch();
    }

    toggleSound() {
        const next = !this.sound.enabled;
        this.sound.setEnabled(next);
        this.updateSoundBtnUI(next);
        this.storage.saveSettings({
            sound: next,
            mode: this.engine.gameMode,
            difficulty: this.engine.aiDifficulty,
            playerSide: this.engine.playerSide
        });
        if (next) this.sound.playClick();
    }

    updateSoundBtnUI(enabled) {
        this.dom.soundToggleBtn.classList.toggle('active', enabled);
        this.dom.soundIcon.textContent = enabled ? '🔊' : '🔇';
        this.dom.soundToggleBtn.title = enabled ? 'Audio Active (Press M to Mute)' : 'Audio Muted (Press M to Unmute)';
    }

    renderBoard() {
        this.dom.cells.forEach((cell, idx) => {
            const val = this.engine.board[idx];
            const markEl = cell.querySelector('.cell-mark');

            cell.className = 'cell';
            if (val === 'X') {
                cell.classList.add('filled', 'mark-x');
                markEl.textContent = 'X';
                cell.setAttribute('aria-label', `${CONFIG.CELL_NAMES[idx]}, occupied by X`);
            } else if (val === 'O') {
                cell.classList.add('filled', 'mark-o');
                markEl.textContent = 'O';
                cell.setAttribute('aria-label', `${CONFIG.CELL_NAMES[idx]}, occupied by O`);
            } else {
                markEl.textContent = '';
                cell.setAttribute('aria-label', `${CONFIG.CELL_NAMES[idx]}, Empty`);
            }
        });
    }

    updateStatusBanner() {
        const curr = this.engine.currentPlayer;
        const isX = curr === 'X';

        this.dom.statusDot.className = `status-indicator-dot ${isX ? 'turn-x' : 'turn-o'}`;
        this.dom.statusPrimary.textContent = `Player ${curr}'s Turn`;

        if (this.engine.gameMode === 'ai') {
            const isUserTurn = curr === this.engine.playerSide;
            this.dom.statusSecondary.textContent = isUserTurn
                ? 'Your turn — select a tactical cell coordinate'
                : 'AI cognition calculating optimal response';
        } else {
            this.dom.statusSecondary.textContent = 'Pass device & make tactical move';
        }
    }

    updateAiTelemetry() {
        if (this.engine.gameMode !== 'ai') return;
        const tel = this.ai.evaluateMoveTelemetry(
            this.engine.board,
            this.engine.aiSide,
            this.engine.playerSide,
            this.engine.aiDifficulty
        );
        this.dom.telemetryCandidates.textContent = tel.candidates;
        this.dom.telemetryThreat.textContent = tel.threat;
        this.dom.telemetryEval.textContent = tel.eval;
        this.dom.telemetryRationale.textContent = tel.rationale;
    }

    appendTimelineItem(snapshot) {
        this.dom.timelineEmpty.style.display = 'none';

        const li = document.createElement('li');
        li.className = 'timeline-item';
        li.dataset.moveNumber = snapshot.moveNumber;

        const isX = snapshot.player === 'X';
        const formattedNum = String(snapshot.moveNumber).padStart(2, '0');

        li.innerHTML = `
            <div class="timeline-item-left">
                <span class="timeline-move-num">#${formattedNum}</span>
                <span class="timeline-mark ${isX ? 'mark-x' : 'mark-o'}">${snapshot.player}</span>
                <span class="timeline-pos">${snapshot.cellName}</span>
            </div>
            <span class="timeline-tag">${snapshot.player === this.engine.playerSide ? 'USER' : 'AI/P2'}</span>
        `;

        this.dom.timelineList.appendChild(li);
        this.dom.timelineContainer.scrollTop = this.dom.timelineContainer.scrollHeight;
    }

    rebuildTimeline() {
        this.dom.timelineList.innerHTML = '';
        if (this.engine.history.length === 0) {
            this.dom.timelineEmpty.style.display = 'flex';
            return;
        }
        this.engine.history.forEach(snapshot => this.appendTimelineItem(snapshot));
    }

    drawWinningStrike(line) {
        if (!line) return;
        const [a, b, c] = line;
        const cellA = this.dom.cells[a].getBoundingClientRect();
        const cellC = this.dom.cells[c].getBoundingClientRect();
        const boardRect = this.dom.board.getBoundingClientRect();

        const x1 = cellA.left + cellA.width / 2 - boardRect.left;
        const y1 = cellA.top + cellA.height / 2 - boardRect.top;
        const x2 = cellC.left + cellC.width / 2 - boardRect.left;
        const y2 = cellC.top + cellC.height / 2 - boardRect.top;

        const length = Math.hypot(x2 - x1, y2 - y1) + 24;
        const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI);
        const centerX = (x1 + x2) / 2;
        const centerY = (y1 + y2) / 2;

        const strike = this.dom.strikeLine;
        strike.style.width = `${length}px`;
        strike.style.height = `6px`;
        strike.style.left = `${centerX - length / 2}px`;
        strike.style.top = `${centerY - 3}px`;
        strike.style.transform = `rotate(${angle}deg)`;
        strike.classList.add('visible');
    }

    clearWinningStrike() {
        this.dom.strikeLine.classList.remove('visible');
        this.dom.cells.forEach(c => c.classList.remove('winning-cell'));
    }

    highlightWinningCells(line) {
        if (!line) return;
        line.forEach(idx => {
            this.dom.cells[idx].classList.add('winning-cell');
        });
    }

    updateSessionScoreboard() {
        this.dom.scoreX.textContent = this.sessionScores.X;
        this.dom.scoreO.textContent = this.sessionScores.O;
        this.dom.scoreDraws.textContent = this.sessionScores.draws;
    }

    resetSessionScores() {
        this.sessionScores = { X: 0, O: 0, draws: 0 };
        this.updateSessionScoreboard();
        this.sound.playClick();
    }

    recordMatchStats(winner, durationSec, tacticalScore) {
        const stats = this.storage.getStats();
        stats.gamesPlayed++;
        stats.totalMoves += this.engine.history.length;
        stats.totalDurationSec += durationSec;

        let resultType = 'DRAW';
        if (winner) {
            if (this.engine.gameMode === 'ai') {
                if (winner === this.engine.playerSide) {
                    stats.wins++;
                    stats.currentStreak = (stats.currentStreak > 0 ? stats.currentStreak : 0) + 1;
                    if (stats.currentStreak > stats.bestStreak) stats.bestStreak = stats.currentStreak;
                    resultType = 'WIN';
                } else {
                    stats.losses++;
                    stats.currentStreak = 0;
                    resultType = 'LOSS';
                }
            } else {
                stats.wins++;
                resultType = `PLAYER ${winner} WIN`;
            }
        } else {
            stats.draws++;
            resultType = 'DRAW';
        }

        this.storage.saveStats(stats);

        // Add to match logs
        this.storage.addMatchLog({
            id: Date.now(),
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            mode: this.engine.gameMode === 'ai' ? `VS AI (${this.engine.aiDifficulty.toUpperCase()})` : 'PASS & PLAY',
            result: resultType,
            moves: this.engine.history.length,
            duration: `${durationSec}s`,
            score: `${tacticalScore}/100`
        });
    }

    /* ========================================================================
       MODAL 1: GAME REVIEW & ANALYSIS (SIGNATURE FEATURE)
       ======================================================================== */
    openReviewModal() {
        if (!this.lastAnalysis) {
            this.lastAnalysis = this.analyzer.analyzeMatch(
                this.engine.history,
                this.engine.winner,
                this.engine.winningLine,
                this.engine.getGameDurationSec(),
                this.engine.gameMode,
                this.engine.playerSide
            );
        }

        const analysis = this.lastAnalysis;
        if (!analysis) return;

        this.sound.playClick();

        // Populate Headline Banner
        const isWin = analysis.winner !== null;
        if (isWin) {
            this.dom.reviewResultBadge.className = 'result-badge win';
            this.dom.reviewResultBadge.textContent = `VICTORY — PLAYER ${analysis.winner}`;
            this.dom.reviewResultHeadline.textContent = `Strategic victory executed in ${analysis.totalMoves} moves`;
        } else {
            this.dom.reviewResultBadge.className = 'result-badge draw';
            this.dom.reviewResultBadge.textContent = 'TACTICAL DRAW';
            this.dom.reviewResultHeadline.textContent = `Equilibrium reached across all 9 grid sectors`;
        }
        this.dom.reviewResultSubtext.textContent = `Elapsed time: ${analysis.durationSec}s • Tactical Rating: ${analysis.tacticalScore}/100 (${analysis.tacticalGrade})`;

        // Tactical score ring
        this.dom.tacticalScoreVal.textContent = analysis.tacticalScore;
        this.dom.tacticalScoreGrade.textContent = analysis.tacticalGrade;
        // Stroke dash calculation for 264 circumference
        const offset = 264 - (264 * analysis.tacticalScore) / 100;
        this.dom.scoreRingProgress.style.strokeDashoffset = offset;

        // Metrics
        this.dom.revTotalMoves.textContent = analysis.totalMoves;
        this.dom.revMoveEfficiency.textContent = analysis.totalMoves <= 6 ? 'High Speed Strike' : 'Controlled Game';
        this.dom.revThreatsBlocked.textContent = analysis.threatsBlocked;
        this.dom.revMissedWins.textContent = analysis.missedWins;
        this.dom.revMissedDesc.textContent = analysis.missedWins === 0 ? 'Flawless Precision' : `${analysis.missedWins} Missed Opening(s)`;

        // Narrative Breakdown
        this.dom.reviewNarrativeBox.innerHTML = '';
        analysis.narrative.forEach(para => {
            const p = document.createElement('p');
            p.innerHTML = para;
            this.dom.reviewNarrativeBox.appendChild(p);
        });

        // Initialize Interactive Stepper
        this.currentStepInspectIndex = 0;
        this.renderReviewStep(0);

        this.dom.reviewModal.removeAttribute('hidden');
    }

    closeReviewModal() {
        this.dom.reviewModal.setAttribute('hidden', '');
    }

    stepReview(delta) {
        if (!this.lastAnalysis || !this.lastAnalysis.evaluatedSteps.length) return;
        const max = this.lastAnalysis.evaluatedSteps.length - 1;
        this.currentStepInspectIndex = Math.max(0, Math.min(max, this.currentStepInspectIndex + delta));
        this.renderReviewStep(this.currentStepInspectIndex);
        this.sound.playClick();
    }

    renderReviewStep(stepIndex) {
        const steps = this.lastAnalysis.evaluatedSteps;
        if (!steps || steps.length === 0) return;

        const step = steps[stepIndex];
        const total = steps.length;

        this.dom.stepCounter.textContent = `Move ${stepIndex + 1} of ${total}`;
        this.dom.stepBadge.textContent = `Move ${step.moveNumber} • Player ${step.player} • [${step.tag}]`;
        this.dom.stepTitle.textContent = step.title;
        this.dom.stepExplanation.textContent = step.explanation;

        this.dom.stepPrevBtn.disabled = stepIndex === 0;
        this.dom.stepNextBtn.disabled = stepIndex === total - 1;

        // Render Mini Board for this step
        const currentBoard = step.boardAfter;
        this.dom.miniCells.forEach((mCell, idx) => {
            const mark = currentBoard[idx];
            mCell.textContent = mark;
            mCell.className = 'mini-cell';
            if (mark === 'X') mCell.classList.add('mark-x');
            if (mark === 'O') mCell.classList.add('mark-o');
            if (idx === step.index) mCell.classList.add('highlight-step');
        });
    }

    /* ========================================================================
       MODAL 2: PERSISTENT LIFETIME STATISTICS & RECENT LOGS
       ======================================================================== */
    toggleStatsModal() {
        const isHidden = this.dom.statsModal.hasAttribute('hidden');
        if (isHidden) {
            this.sound.playClick();
            this.renderLifetimeStats();
            this.dom.statsModal.removeAttribute('hidden');
        } else {
            this.closeStatsModal();
        }
    }

    closeStatsModal() {
        this.dom.statsModal.setAttribute('hidden', '');
    }

    renderLifetimeStats() {
        const stats = this.storage.getStats();
        const logs = this.storage.getMatchLogs();

        const totalGames = stats.gamesPlayed;
        const winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
        const avgMoves = totalGames > 0 ? (stats.totalMoves / totalGames).toFixed(1) : '0.0';

        this.dom.ltGamesPlayed.textContent = totalGames;
        this.dom.ltWinRate.textContent = `${winRate}%`;
        this.dom.ltWinsLosses.textContent = `${stats.wins}W - ${stats.losses}L - ${stats.draws}D`;
        this.dom.ltCurrentStreak.textContent = stats.currentStreak;
        this.dom.ltBestStreak.textContent = stats.bestStreak;
        this.dom.ltAvgMoves.textContent = avgMoves;

        // Table
        this.dom.matchHistoryTableBody.innerHTML = '';
        if (logs.length === 0) {
            this.dom.matchHistoryTableBody.innerHTML = `
                <tr>
                    <td colspan="6" class="table-empty">No historical match logs recorded yet. Complete a match to log telemetry.</td>
                </tr>
            `;
            return;
        }

        logs.forEach((item, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${logs.length - idx}</strong> (${item.date})</td>
                <td>${item.mode}</td>
                <td><strong class="${item.result.includes('WIN') ? 'lt-win' : ''}">${item.result}</strong></td>
                <td>${item.moves}</td>
                <td>${item.duration}</td>
                <td>${item.score}</td>
            `;
            this.dom.matchHistoryTableBody.appendChild(tr);
        });
    }

    clearAllLifetimeStats() {
        if (confirm('Are you sure you want to purge all stored match records and statistics? This cannot be undone.')) {
            this.storage.clearAll();
            this.renderLifetimeStats();
            this.resetSessionScores();
            this.sound.playInvalid();
        }
    }

    /* ========================================================================
       MODAL 3: KEYBOARD CONTROLS & MANUAL
       ======================================================================== */
    toggleHelpModal() {
        const isHidden = this.dom.helpModal.hasAttribute('hidden');
        if (isHidden) {
            this.sound.playClick();
            this.dom.helpModal.removeAttribute('hidden');
        } else {
            this.closeHelpModal();
        }
    }

    closeHelpModal() {
        this.dom.helpModal.setAttribute('hidden', '');
    }

    closeAllModals() {
        this.closeReviewModal();
        this.closeStatsModal();
        this.closeHelpModal();
    }

    isModalOpen() {
        return (
            !this.dom.reviewModal.hasAttribute('hidden') ||
            !this.dom.statsModal.hasAttribute('hidden') ||
            !this.dom.helpModal.hasAttribute('hidden')
        );
    }
}

/* ============================================================================
   9. APPLICATION BOOTSTRAP
   ============================================================================ */
document.addEventListener('DOMContentLoaded', () => {
    window.AppInstance = new UIController();
});