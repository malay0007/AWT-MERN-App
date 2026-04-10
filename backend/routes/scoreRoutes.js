const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const { submitScore, getLeaderboard, getMyScores, getAllScores } = require('../controllers/scoreController');

router.post('/',            protect, submitScore);
router.get('/leaderboard',  protect, getLeaderboard);
router.get('/me',           protect, getMyScores);
router.get('/',             protect, authorize('admin'), getAllScores);

module.exports = router;
