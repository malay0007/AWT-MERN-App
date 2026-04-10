const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  getQuestions, getQuestionsAdmin,
  createQuestion, updateQuestion, deleteQuestion,
  verifyAnswer,
} = require('../controllers/questionController');

router.get('/',         protect, getQuestions);
router.post('/verify',  protect, verifyAnswer);

router.get('/admin',  protect, authorize('admin'), getQuestionsAdmin);
router.post('/',      protect, authorize('admin'), createQuestion);
router.put('/:id',    protect, authorize('admin'), updateQuestion);
router.delete('/:id', protect, authorize('admin'), deleteQuestion);

module.exports = router;
