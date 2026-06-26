import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

router.post('/analyze', (req, res) => {
  const { audio, text } = req.body;
  
  res.json({
    status: 'success',
    analysis: {
      riskScore: Math.random() * 100,
      threatType: 'SIMULATED',
      confidence: 0.85,
      transcription: text || 'Mock transcription',
    },
  });
});

router.post('/report', (req, res) => {
  res.json({ status: 'success', message: 'Report submitted' });
});

export default router;
