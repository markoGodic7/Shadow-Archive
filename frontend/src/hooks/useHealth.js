useEffect(() => {
    let mounted = true;

    fetchHealth()
      .then((data) => {
        if (mounted) setStatus(data.status || 'ok');
      })
      .catch(() => {
        if (mounted) setStatus('error');
      });

    return () => {
      mounted = false;
    };
  }, []);