import {cleanMix} from './data.mjs';
import {activityTracks} from './profiles.mjs';
const definitions={
 study:[['Midnight Study',.35,.2,{rain:.2,vinyl:.09}],['Library Lo-fi',.3,.18,{brown:.08}],['Study Café',.34,.12,{cafe:.24,vinyl:.06}],['Rainy Revision',.28,.2,{rain:.3,thunder:.08}],['Notebook Groove',.4,.15,{vinyl:.14}]],
 work:[['Quiet Desk',0,0,{brown:.22}],['Window Office',.16,.18,{rain:.3}],['Deep Work Shelter',.2,.2,{rain:.18,thunder:.12}],['Coffee and Code',.18,.12,{cafe:.22,brown:.04}],['Clear Headspace',.24,.2,{}]],
 chores:[['Clean Sweep',.5,0,{}],['Kitchen Groove',.45,0,{vinyl:.06}],['Weekend Reset',.52,0,{rain:.08}],['Laundry Dance',.46,0,{cafe:.05}],['One More Room',.55,0,{vinyl:.1}]],
 creative:[['Blank Canvas',.3,.15,{rain:.12}],['Dream Sketch',.28,.2,{brown:.08}],['Late Night Ideas',.32,.15,{vinyl:.08}],['Storm of Inspiration',.26,.12,{rain:.22,thunder:.1}],['Art Room',.3,.12,{cafe:.18}]],
};
export function activityMixes(activity='work') {
 const id=definitions[activity]?activity:'work';const tracks=activityTracks(id);
 return definitions[id].map(([name,volume,binauralLevel,layers],i)=>({id:`${id}-${i}`,name,mix:cleanMix({volume,binauralLevel,layers,beat:10,trackId:tracks[i]})}));
}
