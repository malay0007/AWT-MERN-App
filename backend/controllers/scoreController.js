const Score    = require('../models/Score');
const Question = require('../models/Question');

// @desc    Submit quiz score
// @route   POST /api/scores
// @access  Private (student)
const submitScore = async (req, res) => {
  try {
    const { score, correct, total, avgTime, answers } = req.body;

    const entry = await Score.create({
      user: req.user._id,
      score, correct, total, avgTime, answers,
    });

    res.status(201).json({ success: true, data: entry });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc    Get global leaderboard
// @route   GET /api/scores/leaderboard
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('user', 'name email')
      .sort({ score: -1, createdAt: 1 })
      .limit(20);

    res.json({ success: true, data: scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get scores for the logged-in user
// @route   GET /api/scores/me
// @access  Private
const getMyScores = async (req, res) => {
  try {
    const scores = await Score.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get all scores (admin)
// @route   GET /api/scores
// @access  Private (admin)
const getAllScores = async (req, res) => {
  try {
    const scores = await Score.find()
      .populate('user', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: scores.length, data: scores });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitScore, getLeaderboard, getMyScores, getAllScores };
