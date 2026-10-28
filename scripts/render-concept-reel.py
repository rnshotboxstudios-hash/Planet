"""Render an investor motion study over the three original year-four concept plates.
The moving overlays illustrate crew, transport and power; this is not app footage.
Requires Pillow, numpy, ffmpeg; produces an exact 40s silent H.264 reel.
"""
from PIL import Image,ImageDraw,ImageFont,ImageFilter
import numpy as np, math, subprocess, pathlib
ROOT=pathlib.Path(__file__).resolve().parents[1];OUT=ROOT/'previews/year-4'
W,H,FPS=1600,1000,24
fontpath='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
font=ImageFont.truetype(fontpath,17);small=ImageFont.truetype(fontpath,12);bold=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',22)
shots=[('../10-inspector-design.png','YEAR 1 / MY FIRST WORKSHOP',
 [[(.21,.57),(.35,.62),(.55,.69)]],
 [[(.25,.61),(.33,.66),(.40,.71)],[ (.43,.49),(.47,.51),(.51,.53)]],
 [[(.20,.57),(.35,.62),(.54,.69)]]),
 ('03-master-workshop.png','YEAR 4 / MASTER WORKSHOP',
 [[(.12,.68),(.32,.75),(.50,.81)],[ (.59,.70),(.76,.77),(.96,.83)]],
 [[(.32,.59),(.40,.63),(.47,.68)],[ (.60,.63),(.66,.67),(.74,.71)],[ (.29,.34),(.38,.36),(.45,.39)]],
 [[(.12,.69),(.32,.75),(.49,.82)],[ (.62,.71),(.78,.78),(.94,.84)]]),
 ('02-district.png','YEAR 4 / CONNECTED DISTRICT',
 [[(.24,.41),(.35,.49),(.43,.57)],[ (.57,.58),(.65,.64),(.75,.68)],[ (.44,.37),(.60,.31),(.69,.39)]],
 [[(.28,.48),(.39,.53),(.47,.55)],[ (.56,.52),(.62,.57),(.68,.60)],[ (.42,.69),(.49,.63),(.54,.59)],[ (.69,.46),(.75,.48),(.79,.51)]],
 [[(.30,.40),(.41,.37),(.48,.36)],[ (.61,.42),(.63,.35),(.69,.37)],[ (.36,.73),(.45,.80),(.54,.82),(.63,.79)]]),
 ('01-planet.png','YEAR 4 / A WHOLE PLANET OF POSSIBILITIES',
 [[(.18,.57),(.30,.55),(.41,.47)],[ (.40,.43),(.55,.30),(.64,.34)],[ (.36,.73),(.46,.78),(.57,.76),(.64,.68)]],
 [[(.29,.44),(.38,.45),(.46,.46)],[ (.51,.49),(.57,.48),(.63,.46)],[ (.38,.69),(.47,.65),(.54,.63)],[ (.22,.62),(.28,.60),(.34,.58)]],
 [[(.30,.32),(.40,.28),(.49,.25)],[ (.44,.44),(.53,.29),(.62,.34)],[ (.36,.73),(.46,.79),(.57,.76),(.64,.68)],[ (.23,.56),(.32,.51),(.39,.49)]] )]

def point(path,u):
 lengths=[math.dist(a,b) for a,b in zip(path,path[1:])];total=sum(lengths);dist=(u%1)*total
 for a,b,l in zip(path,path[1:],lengths):
  if dist<=l:return (a[0]+(b[0]-a[0])*dist/l,a[1]+(b[1]-a[1])*dist/l)
  dist-=l
 return path[-1]

def worker(color,phase,size):
 # Original collectible-style moving sprite; 3x antialiasing keeps small crew crisp.
 s=3;im=Image.new('RGBA',(60*s,80*s));d=ImageDraw.Draw(im)
 def box(coords,fill,r=3):d.rounded_rectangle(tuple(int(v*s) for v in coords),radius=r*s,fill=fill)
 def ellipse(coords,fill):d.ellipse(tuple(int(v*s) for v in coords),fill=fill)
 shift=math.sin(phase)*3;ink='#233b31';skin='#efc795'
 ellipse((10,70,50,78),(0,0,0,65))
 box((18+shift,55,28+shift,72),ink);box((33-shift,55,43-shift,72),ink)
 box((14,43,46,62),ink);box((17,45,43,60),color)
 box((10,47+shift,17,59+shift),skin);box((43,47-shift,50,59-shift),skin)
 box((5,6,55,47),ink,10);box((8,9,52,44),skin,8)
 box((7,6,53,21),color,7);box((9,17,17,28),color);box((27,16,38,24),color)
 ellipse((17,25,24,36),ink);ellipse((36,25,43,36),ink);ellipse((18,25,21,28),'white');ellipse((37,25,40,28),'white')
 box((27,38,33,40),ink,1)
 return im.resize((size,round(size*80/60)),Image.Resampling.LANCZOS)
colors=['#64b7a6','#bd8ad1','#e5aa55','#8cbf62']
plates=[]
for filename,label,belts,walks,energy in shots:
 src=Image.open(OUT/filename).convert('RGB');scale=min((W-24)/src.width,(H-102)/src.height);sz=(round(src.width*scale),round(src.height*scale));src=src.resize(sz,Image.Resampling.LANCZOS);x=(W-sz[0])//2;y=42+(H-102-sz[1])//2
 base=Image.new('RGB',(W,H),'#10291f');base.paste(src,(x,y));plates.append((base,x,y,sz,label,belts,walks,energy))
cmd=['ffmpeg','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p','-movflags','+faststart',str(OUT/'planet-year4-investor-reel.mp4')]
p=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=open('/tmp/planet-video-ffmpeg.log','w'))
for frame in range(40*FPS):
 shot=min(3,frame//(10*FPS));t=(frame%(10*FPS))/FPS
 base,x,y,(iw,ih),label,belts,walks,energy=plates[shot];im=base.copy().convert('RGBA');glow=Image.new('RGBA',im.size);gd=ImageDraw.Draw(glow);fg=ImageDraw.Draw(im)
 def xy(pt):return(x+pt[0]*iw,y+pt[1]*ih)
 for k,path in enumerate(energy):
  pts=[xy(pt) for pt in path];gd.line(pts,fill=(68,235,210,48),width=8)
  for j in range(10):
   a=xy(point(path,t*.12+j/10+k*.12));b=xy(point(path,t*.12+j/10+k*.12+.013));gd.line([a,b],fill=(116,255,230,225),width=5);gd.ellipse((a[0]-4,a[1]-4,a[0]+4,a[1]+4),fill=(175,255,240,245))
 im=Image.alpha_composite(im,glow.filter(ImageFilter.GaussianBlur(5)));im=Image.alpha_composite(im,glow);fg=ImageDraw.Draw(im)
 for k,path in enumerate(belts):
  for j in range(5):
   px,py=xy(point(path,t*.075+j/5+k*.07));r=6 if shot==0 else 4
   fg.polygon([(px,py-r),(px+r,py-r/2),(px,py),(px-r,py-r/2)],fill='#f8d283',outline='#735b36');fg.polygon([(px-r,py-r/2),(px,py),(px,py+r),(px-r,py+r/2)],fill='#a87f48');fg.polygon([(px,py),(px+r,py-r/2),(px+r,py+r/2),(px,py+r)],fill='#d2a75a')
 for k,path in enumerate(walks):
  # Ping-pong routes include a pause at each end and a turn-around.
  cycle=(t*.12+k*.24)%2;u=min(1,max(0,cycle if cycle<1 else 2-cycle));px,py=xy(point(path,min(.999,u)));size=[26,31,19,14][shot];sprite=worker(colors[k%4],t*8+k,size)
  if cycle>1:sprite=sprite.transpose(Image.Transpose.FLIP_LEFT_RIGHT)
  im.alpha_composite(sprite,(int(px-size/2),int(py-sprite.height)))
 fg=ImageDraw.Draw(im);fg.rectangle((0,0,W,40),fill='#143b2b');fg.text((22,10),('PLANET  /  YEAR ONE' if shot==0 else 'PLANET  /  YEAR FOUR'),font=font,fill='#e8dfaf');fg.text((W-470,12),'INVESTOR CONCEPT  •  NOT LIVE APP FOOTAGE',font=small,fill='#b4c998')
 fg.rectangle((0,H-57,W,H),fill='#10291f');fg.text((23,H-44),label,font=bold,fill='#f4df9c');fg.text((W-480,H-39),('FIRST WORKSHOP  /  STARTER CREW  /  LEVEL 1' if shot==0 else '20 ROOMS  /  5 BUILDINGS  /  MAX LEVEL 100'),font=small,fill='#adc69a')
 fg.rectangle((0,H-4,int(W*(frame+1)/(40*FPS)),H),fill='#b9d579')
 # Short fades within each ten-second shot, preserving the exact forty-second duration.
 alpha=min(1,t/.3,(10-t)/.3)
 if alpha<1:im=Image.blend(Image.new('RGBA',im.size,'#10291f'),im,alpha)
 p.stdin.write(im.convert('RGB').tobytes())
 if frame%(10*FPS)==0:print('Rendering shot',shot+1,flush=True)
p.stdin.close();code=p.wait()
if code:raise RuntimeError('ffmpeg failed; see /tmp/planet-video-ffmpeg.log')
print('Saved exact 40-second investor concept reel',flush=True)
