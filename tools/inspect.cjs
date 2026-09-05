const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({headless:true,channel:process.env.TEST_BROWSER_CHANNEL || undefined}); const page=await browser.newPage();
 await page.goto('http://127.0.0.1:4187/');
 for(let n=1;n<=2;n++){
 const data=await page.evaluate(async n=>{
  const v=document.createElement('video');v.src=`generated_video (${n}).mp4`;v.muted=true;
  await new Promise((r,j)=>{v.onloadedmetadata=r;v.onerror=j});
  const c=document.createElement('canvas');c.width=960;c.height=540*4;const x=c.getContext('2d');
  for(let i=0;i<4;i++){v.currentTime=Math.min(v.duration-.08,v.duration*i/3);await new Promise(r=>v.onseeked=r);x.drawImage(v,0,i*540,960,540);}
  const last=document.createElement('canvas');last.width=v.videoWidth;last.height=v.videoHeight;last.getContext('2d').drawImage(v,0,0);
  return {duration:v.duration,width:v.videoWidth,height:v.videoHeight,sheet:c.toDataURL('image/jpeg'),last:last.toDataURL('image/jpeg',.96)};
 },n);
 fs.writeFileSync(`assets/reference-${n}.jpg`,Buffer.from(data.sheet.split(',')[1],'base64'));
 fs.writeFileSync(`assets/end-${n}.jpg`,Buffer.from(data.last.split(',')[1],'base64'));
 console.log(n,data.duration,data.width,data.height);
 }await browser.close();
})();



