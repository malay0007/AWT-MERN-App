const Question = require('../models/Question');


const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({ isActive: true }).select('-correctAnswer -explanation');
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const getQuestionsAdmin = async (req, res) => {
  try {
    const questions = await Question.find();
    res.json({ success: true, count: questions.length, data: questions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({ success: true, message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const verifyAnswer = async (req, res) => {
  try {
    const { questionId, selected } = req.body;
    const question = await Question.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });
    res.json({
      success: true,
      correctAnswer: question.correctAnswer,
      explanation:   question.explanation,
      isCorrect:     selected === question.correctAnswer,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
module.exports = { getQuestions, getQuestionsAdmin, createQuestion, updateQuestion, deleteQuestion, verifyAnswer };
