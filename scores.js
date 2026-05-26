exports.handler = async function(event, context) {
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTaE_n6HeW7i8EKob1np82oqQGxiPWcyvBes9rkMSFHoREHUccJp53DaRaCJl2X_kETOJmjBPp4tw7j/pub?gid=982481928&single=true&output=csv';
  
  try {
    const response = await fetch(csvUrl);
    const text = await response.text();
    
    const lines = text.trim().split('\n');
    const scores = [];
    
    lines.forEach(function(line, i) {
      if (i === 0) return;
      const cols = [];
      let cur = '', inQ = false;
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '"') { inQ = !inQ; }
        else if (ch === ',' && !inQ) { cols.push(cur.trim()); cur = ''; }
        else { cur += ch; }
      }
      cols.push(cur.trim());
      const type = (cols[2] || '').replace(/"/g, '').trim();
      const sc = parseInt((cols[3] || '').replace(/"/g, ''));
      const nm = (cols[1] || '').replace(/"/g, '').trim();
      if (type === 'SCORE' && !isNaN(sc) && sc > 0 && nm) {
        scores.push({ name: nm, score: sc, date: (cols[4] || '').trim() });
      }
    });
    
    scores.sort((a, b) => b.score - a.score);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ scores: scores.slice(0, 10) })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
