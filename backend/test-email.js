router.get('/test-email', async (req, res) => {
    await sendNotification({
      userId: 'id_utilisateur_test',
      type: 'test',
      message: 'Test technique',
      details: { target: 1000, achieved: 500, targetDate: new Date() }
    });
    res.send('Email de test envoyé');
  });