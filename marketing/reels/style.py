# -*- coding: utf-8 -*-
"""The look. Written for a phone at arm's length, not for paper.

Three rules drive everything here:

  1. Something is always moving. Enter-and-sit is what made version one feel
     slow even where the cuts were short.
  2. Contrast is high and the accent is loud. A muted palette that reads as
     tasteful on a laptop disappears in a feed.
  3. The type is enormous. 96-130px on a 1080-wide canvas is roughly what a
     phone shows as comfortably readable, and anything smaller loses people who
     are scrolling with one thumb.

No yellow, no gold — that rule holds across the whole company.
"""

CSS = """
__FONTS__
:root{
  --bg1:__BG1__; --bg2:__BG2__; --orb:__ORB__;
  --acc:__ACC__; --acc2:__ACC2__; --ink:__INK__;
  --total:__TOTAL__s;
  --dev:'Noto Devanagari','Manrope',sans-serif;
  --ui:'Manrope',system-ui,sans-serif;
  --mono:'JetBrains Mono',monospace;
}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{width:1080px;height:1920px;overflow:hidden;background:var(--bg1);}
body{font-family:var(--ui);color:var(--ink);}

/* ── Ground ──────────────────────────────────────────────────────────
   Two soft orbs that drift for the whole run, plus a faint grid. The drift
   is slow and never stops, so even a still caption sits on a moving frame. */
.bg{position:absolute;inset:0;overflow:hidden;
    background:linear-gradient(172deg,var(--bg1) 0%,var(--bg2) 62%,var(--bg1) 100%);}
.orb{position:absolute;border-radius:50%;filter:blur(120px);opacity:.55;}
.orb.a{width:900px;height:900px;background:var(--orb);left:-260px;top:-220px;
       animation:driftA var(--total) ease-in-out 0s 1 both;}
.orb.b{width:760px;height:760px;background:var(--acc);right:-280px;bottom:-180px;
       opacity:.34;animation:driftB var(--total) ease-in-out 0s 1 both;}
@keyframes driftA{0%{transform:translate(0,0) scale(1);}
                  50%{transform:translate(180px,140px) scale(1.15);}
                  100%{transform:translate(-60px,60px) scale(1.05);}}
@keyframes driftB{0%{transform:translate(0,0) scale(1.05);}
                  50%{transform:translate(-150px,-120px) scale(1);}
                  100%{transform:translate(80px,-40px) scale(1.12);}}
.grid{position:absolute;inset:0;opacity:.10;
  background-image:linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),
                   linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px);
  background-size:90px 90px;
  animation:gslide var(--total) linear 0s 1 both;}
@keyframes gslide{from{background-position:0 0;}to{background-position:0 -180px;}}

/* ── Scene frame ─────────────────────────────────────────────────────
   Scenes cross-fade over 0.18s. Short, because a long cross-fade is the other
   thing that reads as slow. */
.stage{position:absolute;inset:0;}
.sc{position:absolute;left:88px;right:88px;top:0;bottom:0;
    display:flex;flex-direction:column;justify-content:center;align-items:flex-start;
    gap:44px;opacity:0;
    animation:cut var(--hold) linear var(--in) 1 both;}
@keyframes cut{0%{opacity:0;}
               5%{opacity:1;}
               94%{opacity:1;}
               100%{opacity:0;}}

/* ── Kinetic type ────────────────────────────────────────────────────
   Words arrive one at a time. --d is the per-word offset; --in is the scene's
   own start, so a word's delay is the sum of the two. */
.kin{font-family:var(--dev);font-weight:600;line-height:1.24;letter-spacing:-.015em;}
.kin.lg{font-size:126px;}
.kin.md{font-size:100px;}
.kin.sm{font-size:66px;}
.w{display:inline-block;opacity:0;
   animation:wordin .34s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
@keyframes wordin{
  from{opacity:0;transform:translateY(34px) rotateX(-40deg);}
  to  {opacity:1;transform:none;}}
.hl{color:var(--acc);}
.hl2{color:var(--acc2);}

.eyebrow{font-family:var(--dev);font-size:38px;font-weight:600;
  letter-spacing:.02em;color:var(--acc);
  opacity:0;animation:wordin .3s ease-out calc(var(--in) + var(--d)) 1 both;}

/* ── Counter ─────────────────────────────────────────────────────── */
.bignum{font-family:var(--ui);font-weight:800;font-size:280px;line-height:.92;
  letter-spacing:-.05em;display:flex;align-items:baseline;position:relative;}
.cn{position:absolute;left:0;opacity:0;
    animation:tick .045s step-end calc(var(--in) + var(--d)) 1 both;}
.cn.last{position:relative;
  animation:land .34s cubic-bezier(.2,1.5,.4,1) calc(var(--in) + var(--d)) 1 both;
  background:linear-gradient(100deg,var(--acc),var(--acc2));
  -webkit-background-clip:text;background-clip:text;color:transparent;}
@keyframes tick{0%{opacity:1;}100%{opacity:0;}}
@keyframes land{0%{opacity:0;transform:scale(.7);}100%{opacity:1;transform:none;}}
.bignum .unit{font-family:var(--dev);font-weight:500;font-size:84px;
  color:var(--ink);opacity:.72;margin-left:44px;
  /* .bignum tightens tracking for the digits; Devanagari must not inherit it,
     or conjuncts overlap and the words run together. */
  letter-spacing:normal;white-space:nowrap;}
.undertext{font-family:var(--dev);font-weight:500;font-size:50px;line-height:1.4;
  color:rgba(255,255,255,.78);max-width:880px;}

/* ── Browser ─────────────────────────────────────────────────────── */
.win{width:100%;border-radius:28px;overflow:hidden;background:#0D1220;
  border:2px solid rgba(255,255,255,.16);box-shadow:0 40px 90px rgba(0,0,0,.5);
  animation:rise .40s cubic-bezier(.2,.9,.25,1) calc(var(--in) + .10s) 1 both;}
@keyframes rise{from{opacity:0;transform:translateY(40px) scale(.97);}to{opacity:1;transform:none;}}
.wbar{display:flex;align-items:center;gap:14px;padding:22px 26px;background:#151C2E;}
.wbar i{width:18px;height:18px;border-radius:50%;background:rgba(255,255,255,.28);}
.wbar .url{margin-left:22px;font-family:var(--mono);font-size:30px;
  color:rgba(255,255,255,.62);background:rgba(255,255,255,.07);
  padding:10px 24px;border-radius:999px;}
.wbody{padding:34px;display:flex;flex-direction:column;gap:20px;min-height:520px;}
.bl{border-radius:14px;background:rgba(255,255,255,.10);
    transform-origin:left center;transform:scaleX(0);
    animation:grow .30s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
@keyframes grow{from{transform:scaleX(0);}to{transform:scaleX(1);}}
.b0{height:86px;background:linear-gradient(90deg,var(--acc),var(--acc2));}
.b1{height:34px;width:88%;} .b2{height:34px;width:72%;}
.b3{height:150px;} .b4{height:34px;width:56%;}

/* ── Card: forms, invoices, statements ───────────────────────────── */
.card{width:100%;border-radius:28px;background:#FFFFFF;color:#0B1020;
  padding:38px;box-shadow:0 40px 90px rgba(0,0,0,.45);position:relative;
  animation:rise .40s cubic-bezier(.2,.9,.25,1) calc(var(--in) + .08s) 1 both;}
.ctitle{font-family:var(--dev);font-weight:600;font-size:44px;margin-bottom:26px;}
.frow,.drow{display:flex;justify-content:space-between;align-items:center;
  font-family:var(--dev);font-size:40px;color:#4A5568;
  border:2px solid #E4E9F2;border-radius:16px;padding:24px 26px;margin-bottom:18px;
  opacity:0;animation:slidein .30s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
@keyframes slidein{from{opacity:0;transform:translateX(-26px);}to{opacity:1;transform:none;}}
.fv,.dv{font-weight:700;color:#0B1020;}
.drow.tot{background:#0B1020;color:#fff;border-color:#0B1020;}
.drow.tot .dv{color:var(--acc);}
.cbtn{margin-top:26px;text-align:center;font-family:var(--dev);font-weight:600;
  font-size:42px;color:#fff;padding:28px;border-radius:18px;
  background:linear-gradient(100deg,var(--acc),var(--acc2));}
.cursor{position:absolute;right:120px;bottom:76px;width:34px;height:44px;
  border-radius:4px;background:#0B1020;clip-path:polygon(0 0,0 100%,28% 74%,48% 100%,66% 88%,46% 62%,80% 58%);
  animation:tap 1.1s ease-in-out calc(var(--in) + 1.05s) 1 both;}
@keyframes tap{0%{opacity:0;transform:translate(70px,80px);}
               45%{opacity:1;transform:translate(0,0);}
               60%{transform:translate(0,10px);}
               75%{transform:translate(0,0);}
               100%{opacity:1;transform:translate(0,0);}}

/* ── Notification ────────────────────────────────────────────────── */
.notif{width:100%;border-radius:28px;padding:36px;
  background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.22);
  backdrop-filter:blur(20px);
  animation:drop .42s cubic-bezier(.2,1.3,.4,1) calc(var(--in) + .16s) 1 both;}
@keyframes drop{from{opacity:0;transform:translateY(-60px);}to{opacity:1;transform:none;}}
.nrow{display:flex;align-items:center;gap:26px;}
.nico{width:84px;height:84px;border-radius:22px;flex:0 0 84px;
  background:linear-gradient(135deg,var(--acc),var(--acc2));}
.nt{font-family:var(--dev);font-weight:600;font-size:42px;color:var(--acc);}
.nb{font-family:var(--dev);font-size:38px;color:#fff;margin-top:8px;line-height:1.35;}
.nn{margin-left:auto;font-family:var(--mono);font-size:28px;color:rgba(255,255,255,.6);}

/* ── Home screen ─────────────────────────────────────────────────── */
.home{width:100%;border-radius:36px;padding:44px;
  background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.16);}
.hgrid{display:grid;grid-template-columns:repeat(4,1fr);gap:28px;}
.hgrid i{height:150px;border-radius:34px;background:rgba(255,255,255,.13);
  opacity:0;animation:popin .26s cubic-bezier(.2,1.4,.4,1) calc(var(--in) + var(--d)) 1 both;}
.hgrid i.on{background:linear-gradient(135deg,var(--acc),var(--acc2));
  animation:flyin .5s cubic-bezier(.2,1.5,.4,1) calc(var(--in) + .70s) 1 both;
  box-shadow:0 20px 50px rgba(0,0,0,.5);}
@keyframes popin{from{opacity:0;transform:scale(.7);}to{opacity:1;transform:none;}}
@keyframes flyin{0%{opacity:0;transform:scale(.2) translateY(180px);}
                 100%{opacity:1;transform:none;}}
.hlabel{margin-top:30px;font-family:var(--dev);font-size:38px;
  color:rgba(255,255,255,.75);text-align:center;}

/* ── Dashboard ───────────────────────────────────────────────────── */
.dash{width:100%;border-radius:28px;padding:38px;
  background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.16);}
.dtitle{font-family:var(--dev);font-size:38px;color:rgba(255,255,255,.7);margin-bottom:30px;}
.bars{display:flex;align-items:flex-end;gap:26px;height:400px;}
.bwrap{flex:1;display:flex;flex-direction:column;justify-content:flex-end;
  align-items:center;height:100%;gap:16px;}
.bar{width:100%;border-radius:14px 14px 6px 6px;
  background:linear-gradient(180deg,var(--acc),var(--orb));
  height:var(--h);transform-origin:bottom center;transform:scaleY(0);
  animation:growy .46s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
@keyframes growy{from{transform:scaleY(0);}to{transform:scaleY(1);}}
.blab{font-family:var(--dev);font-size:30px;color:rgba(255,255,255,.62);}

/* ── Chat ────────────────────────────────────────────────────────── */
.thread{width:100%;display:flex;flex-direction:column;gap:22px;}
.bub{font-family:var(--dev);font-size:42px;line-height:1.38;padding:28px 34px;
  border-radius:30px;max-width:84%;opacity:0;
  animation:bubin .30s cubic-bezier(.2,1.3,.4,1) calc(var(--in) + var(--d)) 1 both;}
@keyframes bubin{from{opacity:0;transform:translateY(24px) scale(.94);}to{opacity:1;transform:none;}}
.bub.them{background:rgba(255,255,255,.13);align-self:flex-start;border-bottom-left-radius:10px;}
.bub.us{background:linear-gradient(100deg,var(--acc),var(--acc2));color:#08111F;
  font-weight:600;align-self:flex-end;border-bottom-right-radius:10px;}
.bub.typing{display:flex;gap:12px;padding:34px;}
.bub.typing b{width:16px;height:16px;border-radius:50%;background:rgba(255,255,255,.75);
  animation:blink .9s ease-in-out calc(var(--in) + var(--d)) infinite both;}
.bub.typing b:nth-child(2){animation-delay:calc(var(--in) + var(--d) + .15s);}
.bub.typing b:nth-child(3){animation-delay:calc(var(--in) + var(--d) + .30s);}
@keyframes blink{0%,100%{opacity:.35;transform:translateY(0);}50%{opacity:1;transform:translateY(-8px);}}
.stamp{font-family:var(--mono);font-size:28px;color:rgba(255,255,255,.55);
  align-self:flex-end;opacity:0;
  animation:wordin .3s ease-out calc(var(--in) + var(--d)) 1 both;}

/* ── Wire of nodes ───────────────────────────────────────────────── */
.wires{width:100%;display:flex;flex-direction:column;align-items:flex-start;}
.node{font-family:var(--dev);font-weight:600;font-size:52px;padding:24px 42px;
  border-radius:20px;border:2px solid rgba(255,255,255,.24);
  background:rgba(255,255,255,.07);opacity:0;
  animation:popin .30s cubic-bezier(.2,1.3,.4,1) calc(var(--in) + var(--d)) 1 both;}
.wire{width:6px;height:64px;margin-left:52px;border-radius:3px;position:relative;
  background:rgba(255,255,255,.18);transform-origin:top center;transform:scaleY(0);
  animation:growy .22s linear calc(var(--in) + var(--d)) 1 both;}
.pulse{position:absolute;left:-7px;width:20px;height:20px;border-radius:50%;
  background:var(--acc);box-shadow:0 0 26px 8px var(--acc);
  animation:run .55s ease-in calc(var(--in) + var(--d)) 1 both;}
@keyframes run{from{top:-10px;opacity:0;}20%{opacity:1;}to{top:56px;opacity:0;}}

/* ── Funnel ──────────────────────────────────────────────────────── */
.funnel{width:100%;display:flex;flex-direction:column;align-items:center;}
.fstage{width:var(--w);display:flex;justify-content:space-between;align-items:center;
  padding:26px 40px;border-radius:18px;opacity:0;
  background:linear-gradient(100deg,rgba(255,255,255,.14),rgba(255,255,255,.06));
  border:2px solid rgba(255,255,255,.20);
  animation:widen .34s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
@keyframes widen{from{opacity:0;transform:scaleX(.6);}to{opacity:1;transform:none;}}
.slab{font-family:var(--dev);font-weight:600;font-size:46px;}
.scount{font-family:var(--mono);font-weight:500;font-size:44px;color:var(--acc);}
.drop{width:4px;height:34px;background:rgba(255,255,255,.22);
  transform-origin:top center;transform:scaleY(0);
  animation:growy .18s linear calc(var(--in) + var(--d)) 1 both;}

/* ── Calendar ────────────────────────────────────────────────────── */
.cal{width:100%;border-radius:28px;padding:38px;
  background:rgba(255,255,255,.06);border:2px solid rgba(255,255,255,.16);}
.cgrid{display:grid;grid-template-columns:repeat(6,1fr);gap:20px;}
.cgrid i{aspect-ratio:1;border-radius:16px;background:rgba(255,255,255,.10);
  opacity:0;animation:popin .22s ease-out calc(var(--in) + var(--d)) 1 both;}
.cgrid i.m{background:linear-gradient(135deg,var(--acc),var(--acc2));
  box-shadow:0 10px 30px rgba(0,0,0,.4);}
.cfoot{margin-top:28px;font-family:var(--dev);font-size:36px;color:rgba(255,255,255,.7);}

/* ── Versus ──────────────────────────────────────────────────────── */
.vs{width:100%;display:flex;flex-direction:column;gap:30px;}
.vcol{border-radius:24px;padding:34px 38px;opacity:0;
  animation:slidein .34s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
.vcol.a{background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.16);}
.vcol.b{background:linear-gradient(100deg,var(--acc),var(--acc2));color:#08111F;}
.vlab{display:block;font-family:var(--dev);font-size:34px;font-weight:500;
  letter-spacing:.01em;opacity:.74;margin-bottom:12px;}
.vtxt{font-family:var(--dev);font-weight:600;font-size:62px;line-height:1.2;}

/* ── Ticks ───────────────────────────────────────────────────────── */
.ticks{width:100%;display:flex;flex-direction:column;gap:30px;}
.tick{display:flex;align-items:center;gap:30px;font-family:var(--dev);
  font-weight:600;font-size:66px;opacity:0;
  animation:slidein .32s cubic-bezier(.2,.9,.25,1) calc(var(--in) + var(--d)) 1 both;}
.tk{width:52px;height:52px;flex:0 0 52px;border-radius:50%;
  background:linear-gradient(135deg,var(--acc),var(--acc2));position:relative;}
.tk::after{content:"";position:absolute;left:16px;top:12px;width:14px;height:26px;
  border:5px solid #08111F;border-top:0;border-left:0;transform:rotate(42deg);}

/* ── End card ────────────────────────────────────────────────────── */
.endcard{display:flex;flex-direction:column;gap:44px;}
.lk{opacity:0;animation:wordin .4s ease-out calc(var(--in) + var(--d)) 1 both;}
.lk svg{height:88px;width:auto;display:block;}
.elines{font-family:var(--ui);font-weight:500;font-size:42px;line-height:1.6;
  color:rgba(255,255,255,.82);opacity:0;
  animation:wordin .4s ease-out calc(var(--in) + var(--d)) 1 both;}

/* ── Progress hairline ───────────────────────────────────────────── */
.bar-p{position:absolute;left:0;bottom:0;height:10px;width:100%;
  transform-origin:left center;transform:scaleX(0);
  background:linear-gradient(90deg,var(--acc),var(--acc2));
  animation:fill var(--total) linear 0s 1 both;}
@keyframes fill{from{transform:scaleX(0);}to{transform:scaleX(1);}}
"""
