import{r as s}from"./index.CdJzaNS0.js";/**
 * @license lucide-react v0.470.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const p=r=>r.replace(/([a-z0-9])([A-Z])/g,"$1-$2").toLowerCase(),c=(...r)=>r.filter((e,t,o)=>!!e&&e.trim()!==""&&o.indexOf(e)===t).join(" ").trim();/**
 * @license lucide-react v0.470.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */var w={xmlns:"http://www.w3.org/2000/svg",width:24,height:24,viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:2,strokeLinecap:"round",strokeLinejoin:"round"};/**
 * @license lucide-react v0.470.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const f=s.forwardRef(({color:r="currentColor",size:e=24,strokeWidth:t=2,absoluteStrokeWidth:o,className:n="",children:a,iconNode:l,...i},m)=>s.createElement("svg",{ref:m,...w,width:e,height:e,stroke:r,strokeWidth:o?Number(t)*24/Number(e):t,className:c("lucide",n),...i},[...l.map(([u,d])=>s.createElement(u,d)),...Array.isArray(a)?a:[a]]));/**
 * @license lucide-react v0.470.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const k=(r,e)=>{const t=s.forwardRef(({className:o,...n},a)=>s.createElement(f,{ref:a,iconNode:e,className:c(`lucide-${p(r)}`,o),...n}));return t.displayName=`${r}`,t};/**
 * @license lucide-react v0.470.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const y=k("Database",[["ellipse",{cx:"12",cy:"5",rx:"9",ry:"3",key:"msslwz"}],["path",{d:"M3 5V19A9 3 0 0 0 21 19V5",key:"1wlel7"}],["path",{d:"M3 12A9 3 0 0 0 21 12",key:"mv7ke4"}]]);export{y as D,k as c};
