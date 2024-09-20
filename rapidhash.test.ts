import * as rapidhash from './rapidhash.ts';

const EXPECTS = [
  6516417773221693515n,
  16433971387384506118n,
  8753008157363218713n,
  13899144825680064269n,
  11914515341625380406n,
  8798010771472358040n,
  15981504752182173010n,
  14707724243522973770n,
  15523111126617174849n,
  7118306640759515436n,
  5969109567339997215n,
  14618925369189995889n,
  2042954498105983953n,
  6325200934184034813n,
  14976065773792840686n,
  9423803756277969959n,
  18215083906476135151n,
  14188239318792342003n,
  3083100562932398125n,
  818168606080823402n,
  7702883090455640573n,
  11183849314071955283n,
  3167852447780485748n,
  353653912113841960n,
  9941547445998229028n,
  8757936881647578880n,
  6761875196801796529n,
  15601315917505138683n,
  8042291014401159575n,
  16360710309755073333n,
  12645991930596721313n,
  2725280603776361220n,
  5899432572474988118n,
  6545603971971196473n,
  8359986180543800475n,
  10851062290696735963n,
  16669033982029446552n,
  11986818072778412183n,
  15302094839530429782n,
  5406206011302605492n,
  4026069285018283614n,
  1492946799195963865n,
  5601042884291096777n,
  14032890191467446672n,
  14725154527421702114n,
  8671540362362652291n,
  15420191088087062728n,
  14933326112316430697n,
  1134754207473395081n,
  6019367959246327767n,
  9383895258783901078n,
  8625846325040117687n,
  3268074841348147205n,
  14937796381658873478n,
  12888918610884098672n,
  120449997236153277n,
  5451143092331243507n,
  16312739287599447351n,
  9330206599353075720n,
  17867637026403686870n,
  6391880936949344701n,
  8351294244911919930n,
  1327524332486920361n,
  6616019972687557029n,
  12691801952833132673n,
  15633967626406750518n,
  17391288405736837426n,
  17480406337075258955n,
  14593269050257340451n,
  12320359253615924728n,
  1907836922903133785n,
  15752216360840895143n,
  14414194037067989548n,
  7323617172946652492n,
  11244908074063509141n,
  14077570105132896333n,
  5586320697709689363n,
  12523067923984715372n,
  8914318392581174689n,
  11029423853014978290n,
  98666490724132866n,
  12816039926235606465n,
  9638025561114465099n,
  6044832267400971026n,
  13627544777700234015n,
  8338941429002997178n,
  9974171220560136289n,
  1975395803854576957n,
  8060252413233896724n,
  8843754237719261868n,
  7348305642777126698n,
  18155166286929285582n,
  5694697484664341054n,
  14306315118193299515n,
  14408483448042622447n,
  10358194795549574648n,
  12031147921993515289n,
  11722207421783994500n,
  18218753860147693862n,
  8979409949480607469n,
];

const input = '0123456789abcdef'.repeat(10);

for (const idx in EXPECTS) {
  const i = parseInt(idx, 10);
  let hash = rapidhash.hash(input, i);
  if (hash !== EXPECTS[i]) {
    throw new Error(`unmatched hash ${i} ${hash}`);
  }
  hash = rapidhash.hash(input.slice(0, i));
  if (hash !== EXPECTS[i]) {
    throw new Error(`unmatched hash ${i} ${hash}`);
  }
}
