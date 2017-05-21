
/*
  FIXME:
    multiple tag with one text
    multiple tag-text pair in one line
*/
const lrcParser= {
  parse: (lrc) => {
    let parsed = {lyrics:[]};
    lrc.replace(/\s*\[([^\]]+)\](.*)/g, function(a, tag, l){
      if(/\d{2}:\d{2}(\.\d{2})?/.test(tag)) {
        let time;
        tag.replace(/(\d{2}):(\d{2})\.?(\d{2})?/, function(a, m, s, ms){
          time = parseInt(m, 10)*60+parseInt(s, 10);
          if(ms)
            time += parseInt(ms, 10)*0.01;
        });
        parsed.lyrics.push({time, text: l});
      }
      else {
        tag = tag.split(':');
        parsed[tag[0]] = tag[1];
      }
    });
    return parsed;
  },
  timestamp: (t) => {
    return `[${('00'+parseInt(t/60,10).toString()).slice(-2)}:${
      ('00'+parseInt(t%60,10).toString()).slice(-2)}.${
        ('00'+parseInt(t*100%100,10).toString()).slice(-2)
    }]`;
  },
  offset: function(lrc, o) {
    console.log(this);
    const self = this;
    return lrc.replace(/\s*\[([^\]]+)\](.*)/g, (a, tag, l)=>{
      if(/\d{2}:\d{2}(\.\d{2})?/.test(tag)) {
        let time;
        tag.replace(/(\d{2}):(\d{2})\.?(\d{2})?/, function(a, m, s, ms){
          time = parseInt(m, 10)*60+parseInt(s, 10);
          if(ms)
            time += parseInt(ms, 10)*0.01;
        });
        return self.timestamp(time-o)+l+"\n";
      }
      else {
        return a.replace(/\n/g,'')+"\n";
      }
    });
  },
}

export default lrcParser;
