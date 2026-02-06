
import { OlympicEvent } from './types';

const rawEvents = [
  {
    id: 'ALP-1',
    sport: 'Alpine Skiing',
    name: "Men's Downhill",
    gender: 'Men',
    intel: "Switzerland's Marco Odermatt is the heavy favorite after dominating World Cup circuit. Austria (Kriechmayr) and Norway (Kilde) are strong challengers. Swiss team has won 4 of last 6 Olympic downhills. Course features 800m vertical drop - technical sections favor experienced racers. Dark horse: Canada's Cameron Alexander."
  },
  {
    id: 'ALP-2',
    sport: 'Alpine Skiing',
    name: "Men's Super-G",
    gender: 'Men',
    intel: "Marco Odermatt (SUI) is defending champion and current World Cup leader. Event has 40% upset rate historically - Vincent Kriechmayr (AUT) won 2021 gold. Swiss/Austrian battle expected. Weather-dependent event - morning starters have 15% advantage. Austria leads all-time medals (11)."
  },
  {
    id: 'ALP-3',
    sport: 'Alpine Skiing',
    name: "Men's Giant Slalom",
    gender: 'Men',
    intel: "Odermatt's strongest event (6 World Cup wins this season). France's Alexis Pinturault and Norway's Henrik Kristoffersen are main threats. Technical precision required - podium always includes at least one Austrian or Swiss. Historic low upset rate (85% favorites medal). Safe fantasy pick."
  },
  {
    id: 'ALP-4',
    sport: 'Alpine Skiing',
    name: "Men's Slalom",
    gender: 'Men',
    intel: "Most unpredictable alpine event - no repeat champion since 2006. Austria's Manuel Feller and Norway's Henrik Kristoffersen lead World Cup. Gate-crasher potential high. France has surprise podium history. Two-run format means first-run leaders have 60% medal rate. High-risk, high-reward pick."
  },
  {
    id: 'ALP-5',
    sport: 'Alpine Skiing',
    name: "Men's Alpine Combined",
    gender: 'Men',
    intel: "Downhill + Slalom hybrid favors all-rounders. Pinturault (FRA) won 2018, strong again. Swiss and Austrian depth gives medal odds. Event requires top-15 downhill finish to medal - eliminates pure slalom specialists. Watch for technical skiers with speed skills."
  },
  {
    id: 'ALP-6',
    sport: 'Alpine Skiing',
    name: "Women's Downhill",
    gender: 'Women',
    intel: "Sofia Goggia (ITA) is the speed queen - won 2022 Olympic silver, 4 World Cup downhills this season. Switzerland's Corinne Suter and Austria's Cornelia Huetter are threats. Italian women have won 3 of last 4 Olympic speed events. Course suits aggressive racers. Goggia at 40% win probability."
  },
  {
    id: 'ALP-7',
    sport: 'Alpine Skiing',
    name: "Women's Super-G",
    gender: 'Women',
    intel: "Wide-open race. Lara Gut-Behrami (SUI) defending champion but inconsistent this season. Austria's Huetter and USA's Mikaela Shiffrin (if she enters) are contenders. Swiss women have 5 Olympic super-G medals. Weather lottery event - start position matters 20%."
  },
  {
    id: 'ALP-8',
    sport: 'Alpine Skiing',
    name: "Women's Giant Slalom",
    gender: 'Women',
    intel: "Mikaela Shiffrin (USA) chasing historic 3rd Olympic GS medal. Sara Hector (SWE) is defending champion. Italian Federica Brignone strong on technical courses. Shiffrin has 15 World Cup GS wins - clear favorite at 55% podium odds. Safe bet for fantasy."
  },
  {
    id: 'ALP-9',
    sport: 'Alpine Skiing',
    name: "Women's Slalom",
    gender: 'Women',
    intel: "Shiffrin's signature event - 2014 Olympic champion, 60+ World Cup wins. Slovakia's Petra Vlhova and Switzerland's Wendy Holdener are main rivals. American women 0-2-1 all-time, Shiffrin can change that. Two runs, 100-gate course. Podium lock if Shiffrin finishes. Sweden dark horse."
  },
  {
    id: 'ALP-10',
    sport: 'Alpine Skiing',
    name: "Women's Alpine Combined",
    gender: 'Women',
    intel: "Versatility test. Shiffrin and Gut-Behrami co-favorites. Swiss women have won 3 of last 4 combined golds. Requires top-20 downhill speed + slalom precision. Event eliminates speed-only racers early. Gut-Behrami 45% medal odds."
  },
  {
    id: 'BIA-1',
    sport: 'Biathlon',
    name: "Men's 10km Sprint",
    gender: 'Men',
    intel: "Johannes Thingnes Bø (NOR) is dominant - 2022 gold medalist, 95% shooting accuracy. France's Quentin Fillon Maillet and Sweden's Sebastian Samuelsson are threats. Norwegian men have 8 Olympic biathlon golds. Shooting range elevation 1850m affects accuracy - wind is factor. Bø 60% win probability."
  },
  {
    id: 'BIA-2',
    sport: 'Biathlon',
    name: "Men's 20km Individual",
    gender: 'Men',
    intel: "Endurance + precision battle. Each missed shot = 1min penalty. Bø and Sturla Holm Lægreid (NOR) lead. Germany's Benedikt Doll (2022 bronze) hungry for gold. Event rewards consistency over speed - 85%+ shooting required for podium. Norwegian 1-2 likely."
  },
  {
    id: 'BIA-3',
    sport: 'Biathlon',
    name: "Men's 12.5km Pursuit",
    gender: 'Men',
    intel: "Chasing format based on 10km sprint results. Bø starts with advantage if he wins sprint. France strong in pursuits (4 medals 2018-2022). Dramatic comebacks possible - 2022 saw 30-second deficit overcome. Strategy: pick sprint leaders for pursuit."
  },
  {
    id: 'BIA-4',
    sport: 'Biathlon',
    name: "Men's 15km Mass Start",
    gender: 'Men',
    intel: "All 30 racers start together - pure chaos. Shooting under pressure decides medals. Bø (NOR) has 3 World Cup mass start wins. Germany's Philipp Nawrath emerging. Pack racing creates 40% upset potential. Final shooting round at 12.5km is make-or-break. High variance event."
  },
  {
    id: 'BIA-5',
    sport: 'Biathlon',
    name: "Men's 4x7.5km Relay",
    gender: 'Men',
    intel: "Norway is powerhouse - won 2022 gold, 75% relay medal rate. France (defending World Champs) and Sweden competitive. Team depth matters - all 4 must perform. Anchor leg shooting decides 60% of medals. Norway-France battle expected. Safe Norway pick."
  },
  {
    id: 'BIA-6',
    sport: 'Biathlon',
    name: "Women's 7.5km Sprint",
    gender: 'Women',
    intel: "Elvira Öberg (SWE) is speed demon with 92% shooting. France's Julia Simon and Norway's Marte Olsbu Røiseland (2022 triple gold) are threats. Swedish women surging - 5 World Cup wins this season. Sprint is launching pad for pursuit medals. Öberg 50% win odds."
  },
  {
    id: 'BIA-7',
    sport: 'Biathlon',
    name: "Women's 15km Individual",
    gender: 'Women',
    intel: "Marathon of concentration - 4 shooting stages. Røiseland defending champion. Germany's Denise Herrmann-Wick (2022 gold) retired, opening field. French women have 6 individual Olympic golds. Perfect shooting (20/20) gives huge advantage. Norwegian depth favors Røiseland."
  },
  {
    id: 'BIA-8',
    sport: 'Biathlon',
    name: "Women's 10km Pursuit",
    gender: 'Women',
    intel: "Starts based on sprint gaps. Swedish sisters Elvira and Hanna Öberg both contenders. France's Simon strong in pursuits. Røiseland chasing historic 4th gold. Pursuit comebacks common - 40-second deficits overcome. Pick sprint top-5 finishers."
  },
  {
    id: 'BIA-9',
    sport: 'Biathlon',
    name: "Women's 12.5km Mass Start",
    gender: 'Women',
    intel: "30 women, one champion. Røiseland has 2 World Cup mass start wins. Italy's Dorothea Wierer (2020 World Champ) dangerous. Tight pack racing, final shooting at 10km decides 70% of medals. Norwegian-French showdown likely. High drama, high upsets (35% rate)."
  },
  {
    id: 'BIA-10',
    sport: 'Biathlon',
    name: "Women's 4x6km Relay",
    gender: 'Women',
    intel: "France is dynasty - 2022 gold, 3 straight World Championship golds. Norway and Sweden competitive. Relay shooting has spare rounds - pressure slightly reduced. French team depth unmatched. Anchor Anaïs Chevalier-Bouchet clutch. France 65% medal odds."
  },
  {
    id: 'BOB-1',
    sport: 'Bobsleigh',
    name: "Two-Man Bobsled",
    gender: 'Men',
    intel: "Germany's Francesco Friedrich is GOAT - 2018/2022 double Olympic champion, 13 World titles. Swiss and Canadian crews competitive. German engineering advantage on fast tracks. Start times (first 50m) predict 80% of results. Friedrich 70% gold probability. Germany sled tech superior."
  },
  {
    id: 'BOB-2',
    sport: 'Bobsleigh',
    name: "Four-Man Bobsled",
    gender: 'Men',
    intel: "Friedrich going for 3rd straight Olympic gold - unprecedented. USA's Hunter Church and Canada's Justin Kripps (2018 co-gold) are threats. 4-man requires perfect push + pilot precision. German sleds have 0.15s/run advantage. Track design favors technical drivers. Friedrich 60% win odds."
  },
  {
    id: 'BOB-3',
    sport: 'Bobsleigh',
    name: "Two-Woman Bobsled",
    gender: 'Women',
    intel: "USA's Elana Meyers Taylor is legend - 2022 silver at age 37. Germany's Laura Nolte (2022 gold) and Mariama Jamanka competitive. American women have 3 Olympic golds. Push athlete strength matters more in 2-woman. Home-built USA sleds fast. Meyers Taylor 55% podium odds."
  },
  {
    id: 'BOB-4',
    sport: 'Bobsleigh',
    name: "Women's Monobob",
    gender: 'Women',
    intel: "New Olympic event (debuted 2022). USA's Kaillie Humphries won 2022 gold. Germany's Nolte and Canada's Christine de Bruin strong. Solo pilot event - pure driving skill, no push athlete. Equipment standardized - reduces German tech edge. Wide open race. Humphries 45% gold odds."
  },
  {
    id: 'CUR-1',
    sport: 'Curling',
    name: "Men's Tournament",
    gender: 'Men',
    intel: "Canada and Sweden are traditional powers - Canada has 3 Olympic golds. Team Edin (SWE) won 2022, Team Gushue (CAN) strong. Great Britain's Team Mouat rising threat. Round-robin into playoffs. Hammer advantage (last stone) wins 60% of ends. Swedish precision vs Canadian aggression."
  },
  {
    id: 'CUR-2',
    sport: 'Curling',
    name: "Women's Tournament",
    gender: 'Women',
    intel: "Great Britain won 2022 gold - Team Muirhead defending. Switzerland's Team Tirinzoni (4x World Champs) favorites. Canada's Team Homan hungry. Swiss women have 70% playoff win rate. Ice reading critical - home teams historically struggle. Switzerland 55% medal probability."
  },
  {
    id: 'CUR-3',
    sport: 'Curling',
    name: "Mixed Doubles",
    gender: 'Mixed',
    intel: "Italy's Amos Mosaner/Stefania Constantini won 2022 (shocking). Great Britain and Sweden strong. Format: 2 players, 8 ends, speed chess of curling. Upset rate 45% - small teams create variance. Sweep technique matters more. Watch for Canadian and Swiss pairs. Italy repeat unlikely."
  },
  {
    id: 'FIG-1',
    sport: 'Figure Skating',
    name: "Men's Singles",
    gender: 'Men',
    intel: "USA's Ilia Malinin is quad revolution - lands 6 types of quads. Japan's Yuma Kagiyama (2022 silver) and Shoma Uno (2022 gold) strong. Malinin's quad Axel gives 15-point advantage. Artistic vs technical debate. Japanese depth unmatched (3 top-10 skaters). Malinin 60% gold odds if clean."
  },
  {
    id: 'FIG-2',
    sport: 'Figure Skating',
    name: "Women's Singles",
    gender: 'Women',
    intel: "Wide open after Russian absence. South Korea's Lee Hae-in and Japan's Kaori Sakamoto (2022 gold) lead. USA's Isabeau Levito rising. Triple Axel required for podium - only 5 women land it consistently. Presentation scores (PCS) matter in close races. Sakamoto 50% podium."
  },
  {
    id: 'FIG-3',
    sport: 'Figure Skating',
    name: "Pairs",
    gender: 'Mixed',
    intel: "China's Sui Wenjing/Han Cong won 2022 gold, still strong. Italy and Canada competitive. Throw quads and twist lifts separate medalists. Chinese pair skating school dominant (3 straight Olympic golds). Execution matters more than difficulty in judging. China 65% gold probability."
  },
  {
    id: 'FIG-4',
    sport: 'Figure Skating',
    name: "Ice Dance",
    gender: 'Mixed',
    intel: "France's Gabriella Papadakis/Guillaume Cizeron won 2022 with world-record score. USA's Chock/Bates and Italy's Guignard/Fabbri competitive. Ice dance emphasizes artistry over jumps. French couple undefeated in last 3 years. Pattern dances and free dance equally weighted. France 70% win odds."
  },
  {
    id: 'FIG-5',
    sport: 'Figure Skating',
    name: "Team Event",
    gender: 'Mixed',
    intel: "USA leads team depth - medalists in 3 categories. Japan (singles powerhouse) and Italy strong. Format: men's/women's/pairs/ice dance scores combined. Singles scores worth 2x. Deep teams win - requires 8 skaters. USA-Japan battle expected. USA 60% medal probability."
  },
  {
    id: 'FREE-1',
    sport: 'Freestyle Skiing',
    name: "Men's Aerials",
    gender: 'Men',
    intel: "China dominates - Qi Guangpu (2022 gold) and Wang Xindi lead. USA and Belarus competitive. Triple flips with 4+ twists are standard. Chinese aerial program has 50 years dominance. Degree of difficulty (DD) scores range 4.5-5.1. Qi 55% win probability."
  },
  {
    id: 'FREE-2',
    sport: 'Freestyle Skiing',
    name: "Men's Moguls",
    gender: 'Men',
    intel: "Sweden's Walter Wallberg (2022 gold) defending. Canada and Japan strong. Moguls = turns (60%) + air (20%) + speed (20%). Canadian bump skiing tradition deep. Wallberg's triple full gives edge. Upset rate 30% - consistency matters. Sweden 45% medal odds."
  },
  {
    id: 'FREE-3',
    sport: 'Freestyle Skiing',
    name: "Men's Halfpipe",
    gender: 'Men',
    intel: "USA's Alex Ferreira (2022 silver) and New Zealand's Nico Porteous (2022 gold) lead. Canadian Brendan Mackay rising. Double cork 1620 is baseline trick. Amplitude + technical difficulty + style judged. American/Canadian halfpipe dominance. Porteous 50% gold probability."
  },
  {
    id: 'FREE-4',
    sport: 'Freestyle Skiing',
    name: "Men's Slopestyle",
    gender: 'Men',
    intel: "Switzerland's Andri Ragettli and Canada's Max Moffatt lead. Format: rails + jumps scored for creativity. Triple cork 1800s standard on jumps. Weather-dependent - wind cancels runs. Swiss team has 3 X-Games golds this year. Canadian depth gives 60% medal rate."
  },
  {
    id: 'FREE-5',
    sport: 'Freestyle Skiing',
    name: "Men's Big Air",
    gender: 'Men',
    intel: "Norway's Birk Ruud (2022 gold) defending. Best 2 of 3 tricks count. Quad cork 1980 is cutting edge. Big air rewards risk-taking - fall rate 40%. Ruud's switch triple 1980 gives advantage. Swiss and Canadian riders threatening. Ruud 45% repeat odds."
  },
  {
    id: 'FREE-6',
    sport: 'Freestyle Skiing',
    name: "Men's Ski Cross",
    gender: 'Men',
    intel: "Canada's Reece Howden and Switzerland's Ryan Regez lead. 4-racer heats, physical racing. Crashes common (25% DNF rate). Canadian men have 2 Olympic golds. Gate strategy matters - inside line 15% faster. Swiss consistency vs Canadian aggression. High variance event."
  },
  {
    id: 'FREE-7',
    sport: 'Freestyle Skiing',
    name: "Women's Aerials",
    gender: 'Women',
    intel: "China's Xu Mengtao won 2022 gold at age 31. USA and Australia competitive. Women's triple flips now standard. Chinese women have 3 Olympic golds. DD scores 3.9-4.5 range. Xu's experience gives edge. China 50% medal rate."
  },
  {
    id: 'FREE-8',
    sport: 'Freestyle Skiing',
    name: "Women's Moguls",
    gender: 'Women',
    intel: "Australia's Jakara Anthony (2022 gold) defending. USA's Jaelin Kauf (2022 silver) strong. French women rising. Cork 720 air required for podium. Australian program surging - 2 recent World golds. Anthony 55% medal probability."
  },
  {
    id: 'FREE-9',
    sport: 'Freestyle Skiing',
    name: "Women's Halfpipe",
    gender: 'Women',
    intel: "China's Gu Ailing (Eileen Gu) won 2022 gold, still dominant. Canada's Cassie Sharpe and USA's Brita Sigourney competitive. Gu's double cork 1440s + amplitude unmatched. Chinese funding behind Gu is massive. Gu 70% win probability if healthy."
  },
  {
    id: 'FREE-10',
    sport: 'Freestyle Skiing',
    name: "Women's Slopestyle",
    gender: 'Women',
    intel: "Switzerland's Mathilde Gremaud (2022 gold) and Estonia's Kelly Sildaru lead. Rails sections separated top skiers. Switch double 1260 on jumps is standard. Swiss women dominate X-Games. Gremaud's rail creativity gives 10-point edge. Switzerland 60% podium odds."
  },
  {
    id: 'FREE-11',
    sport: 'Freestyle Skiing',
    name: "Women's Big Air",
    gender: 'Women',
    intel: "Gu Ailing won 2022, heavy favorite. France's Tess Ledeux competitive. Women's triple cork 1620 now possible. Gu does both switch and regular big spins. Best 2 of 3 format rewards consistency + risk. Gu 65% gold odds."
  },
  {
    id: 'FREE-12',
    sport: 'Freestyle Skiing',
    name: "Women's Ski Cross",
    gender: 'Women',
    intel: "Switzerland's Fanny Smith (veteran) and Sweden's Sandra Näslund (2022 gold) lead. 4-woman heats, crash rate 30%. Swedish women strong in X-Games. Smith's experience vs Näslund's speed. Gate tactics critical. Sweden 55% medal probability."
  },
  {
    id: 'FREE-13',
    sport: 'Freestyle Skiing',
    name: "Mixed Team Aerials",
    gender: 'Mixed',
    intel: "China won 2022, overwhelming favorites. Format: 3 athletes (1M, 1W, 1 either). Chinese team coordination superior. USA and Switzerland competitive. Team synchronization scored. China has 8-person depth chart. China 75% gold probability."
  },
  {
    id: 'ICE-1',
    sport: 'Ice Hockey',
    name: "Men's Tournament",
    gender: 'Men',
    intel: "NHL stars return - Connor McDavid (CAN), Auston Matthews (USA), Mikko Rantanen (FIN) leading. Canada and USA co-favorites. Finland (2022 gold) dangerous with depth. Round-robin into single-elim playoffs. North American goaltending advantage. Canada 40%, USA 35% gold odds. Sweden dark horse."
  },
  {
    id: 'ICE-2',
    sport: 'Ice Hockey',
    name: "Women's Tournament",
    gender: 'Women',
    intel: "USA vs Canada dominance - have met in 6 straight Olympic finals. USA won 2018, Canada 2022. Both teams loaded with PWHL stars. Hilary Knight (USA) and Marie-Philip Poulin (CAN) are icons. Czech Republic and Finland improving but 20-goal underdogs. USA-Canada final 95% likely. USA slight edge 52-48."
  },
  {
    id: 'LUG-1',
    sport: 'Luge',
    name: "Men's Singles",
    gender: 'Men',
    intel: "Austria's Johannes Ludwig (2022 gold) defending. German depth threatens. 4 runs, combined time wins. German luge program has 40+ Olympic medals. Ludwig's sled aerodynamics superior. Start technique matters - 0.01s = 0.03s finish. Ludwig 60% medal odds."
  },
  {
    id: 'LUG-2',
    sport: 'Luge',
    name: "Women's Singles",
    gender: 'Women',
    intel: "Germany's Anna Berreiter and Julia Taubitz lead. Austrian Madeleine Egle (2022 gold) defending. German women have 12 Olympic luge golds. Sled runners replaced between runs - maintenance critical. Taubitz's consistency gives edge. Germany 70% medal probability."
  },
  {
    id: 'LUG-3',
    sport: 'Luge',
    name: "Doubles",
    gender: 'Mixed',
    intel: "Germany's Wendl/Arlt dynasty (2 Olympic golds) ended. Austria's Steu/Koller lead. German doubles program historically 80% medal rate. Doubles requires matched body positioning for aerodynamics. Austria 55% gold odds."
  },
  {
    id: 'LUG-4',
    sport: 'Luge',
    name: "Team Relay",
    gender: 'Mixed',
    intel: "Germany won 2022 gold, 3 straight Olympic relay golds. Format: men's + women's + doubles times combined. German program depth unmatched. Austria and Italy competitive. Relay start technique (touchpad) practiced 1000+ times. Germany 80% gold probability."
  },
  {
    id: 'NOR-1',
    sport: 'Nordic Combined',
    name: "Individual Normal Hill",
    gender: 'Men',
    intel: "Norway's Jarl Magnus Riiber is dominant (5x World Champion). Germany and Austria competitive. Format: ski jump converts to time advantage in 10km XC race. Riiber's jump (K-point+) gives 30s lead. Norwegian XC skiing depth. Riiber 65% win odds."
  },
  {
    id: 'NOR-2',
    sport: 'Nordic Combined',
    name: "Individual Large Hill",
    gender: 'Men',
    intel: "Riiber again favored. Large hill = bigger time gaps from jump. Germany's Vinzenz Geiger (2022 gold) competitive. Jumping counts more on large hill - 15% advantage. Nordic combined dying sport (removed 2030). Riiber 60% gold odds."
  },
  {
    id: 'NOR-3',
    sport: 'Nordic Combined',
    name: "Team Large Hill",
    gender: 'Men',
    intel: "Norway has won 3 of last 4 Olympic team golds. Format: 4-man team jump + 4x5km relay. Norwegian team depth gives 45s+ advantage. Germany and Austria chase. Team strategy: save strongest XC skier for anchor. Norway 75% gold probability."
  },
  {
    id: 'SHORT-1',
    sport: 'Short Track',
    name: "Men's 500m",
    gender: 'Men',
    intel: "China and South Korea battle - Wu Dajing (CHN) won 2018 gold. Short track = chaos + strategy. Heats into finals format. Crashes common (30% rate). Korea's Hwang Daeheon (2022 1000m gold) strong. China home advantage. Pass on final lap wins 70% of races."
  },
  {
    id: 'SHORT-2',
    sport: 'Short Track',
    name: "Men's 1000m",
    gender: 'Men',
    intel: "Hwang Daeheon (KOR) defending champion. Strategy matters - stay 2nd until final 2 laps. Chinese team strong. Olympic curse: 0 repeat champions in 1000m. Disqualifications frequent (20%). Korea's short track system brutal but effective. Hwang 50% medal odds."
  },
  {
    id: 'SHORT-3',
    sport: 'Short Track',
    name: "Men's 1500m",
    gender: 'Men',
    intel: "Longer race = more passing opportunities. Korea and China dominate. Netherlands rising threat. Steven Dubois (CAN) won 2022 silver. 1500m requires stamina + positioning. Korea 60% medal rate historically. Wide open race - 35% upset potential."
  },
  {
    id: 'SHORT-4',
    sport: 'Short Track',
    name: "Men's 5000m Relay",
    gender: 'Men',
    intel: "Canada won 2022 gold (shocking upset). Korea and China usual powers. Format: 4 men, 45 laps, constant exchanges. Team tactics critical - blocking rivals. Canada's Montreal training center producing medals. Korea-China rivalry intense. Canada 40% repeat odds."
  },
  {
    id: 'SHORT-5',
    sport: 'Short Track',
    name: "Women's 500m",
    gender: 'Women',
    intel: "China and Korea battle. Netherlands' Suzanne Schulting (2018 gold) strong. 500m is pure speed sprint. Start position advantage (20%). Crashes in semifinals common. Korea's Choi Minhjeong veteran threat. China 45% medal probability."
  },
  {
    id: 'SHORT-6',
    sport: 'Short Track',
    name: "Women's 1000m",
    gender: 'Women',
    intel: "Schulting (NED) won 2022, strong again. Korea's Choi Minhjeong chasing 3rd Olympic gold. Chinese rising. 1000m sweet spot - speed + strategy balanced. Pass on last lap or lead from start both work. Netherlands 50% gold odds."
  },
  {
    id: 'SHORT-7',
    sport: 'Short Track',
    name: "Women's 1500m",
    gender: 'Women',
    intel: "Korea won 2022 (Choi Minhjeong). Longer race favors endurance. Dutch and Chinese competitive. 1500m has highest crash rate (35%). Staying upright more important than speed. Korea's program depth gives 65% medal rate."
  },
  {
    id: 'SHORT-8',
    sport: 'Short Track',
    name: "Women's 3000m Relay",
    gender: 'Women',
    intel: "China and Korea dynasty - 16 of last 18 Olympic relay medals. Format: 4 women, 27 laps. Netherlands (Schulting anchor) rising. Relay exchanges practiced 10000+ times. Team synchronization critical. Korea slight edge over China. Korea 55% gold odds."
  },
  {
    id: 'SHORT-9',
    sport: 'Short Track',
    name: "Mixed 2000m Relay",
    gender: 'Mixed',
    intel: "New Olympic event (2022 debut). China won inaugural gold. Format: 2M + 2W, 18 laps. Strategy: who races which laps matters. Mixed relay creates tactical complexity. Italy surprise 2022 silver medalist. China 50% repeat odds."
  },
  {
    id: 'SKEL-1',
    sport: 'Skeleton',
    name: "Men's",
    gender: 'Men',
    intel: "Great Britain's Chris Duckworth and Marcus Wyatt lead. China's Yan Wengang (2022 gold) defending. Headfirst sledding at 90mph. British skeleton program has 5 Olympic medals. Start speed predicts 75% of finish. GB 60% medal probability."
  },
  {
    id: 'SKEL-2',
    sport: 'Skeleton',
    name: "Women's",
    gender: 'Women',
    intel: "Great Britain's Laura Deas and Germany's Hannah Neise (2022 gold) lead. British women have 3 Olympic golds. Sled customization critical - runner temperature ±0.5°C affects time. Neise's technical piloting superior. GB-Germany battle expected. Germany 55% gold odds."
  },
  {
    id: 'SKI-1',
    sport: 'Ski Jumping',
    name: "Men's Normal Hill Individual",
    gender: 'Men',
    intel: "Norway's Halvor Egner Granerud and Austria's Stefan Kraft lead. Normal hill K-point 108m. Telemark landing + style scored. Norwegian program resurgent. Wind lottery affects 30% of jumps. Granerud 50% medal odds."
  },
  {
    id: 'SKI-2',
    sport: 'Ski Jumping',
    name: "Men's Large Hill Individual",
    gender: 'Men',
    intel: "Large hill K-point 125m - bigger jumps, more prestigious. Germany's Karl Geiger and Poland's Kamil Stoch (2-time Olympic champion) competitive. Stoch chasing history (age 38). Ski jumping has oldest Olympic medalist ever (46). Geiger 45% gold probability."
  },
  {
    id: 'SKI-3',
    sport: 'Ski Jumping',
    name: "Men's Team Large Hill",
    gender: 'Men',
    intel: "Austria won 2022 team gold. Germany and Norway strong. Format: 4 jumpers, 8 jumps total. Team depth critical - weakest jumper costs medals. Austrian team consistency gives edge. Wind conditions affect all equally. Austria 55% repeat odds."
  },
  {
    id: 'SKI-4',
    sport: 'Ski Jumping',
    name: "Women's Normal Hill Individual",
    gender: 'Women',
    intel: "Slovenia's Nika Kriznar (2022 gold) and Germany's Katharina Althaus lead. Women's ski jumping (Olympic since 2014) growing fast. German women have 4 Olympic medals. K-point 90m for women. Althaus's consistency vs Kriznar's big jumps. Germany 50% medal probability."
  },
  {
    id: 'SKI-5',
    sport: 'Ski Jumping',
    name: "Mixed Team Normal Hill",
    gender: 'Mixed',
    intel: "Slovenia won 2022 mixed team gold. Format: 2M + 2W, 8 jumps. Program depth matters more than star power. Austria and Germany competitive. Mixed team creates strategic choices. Slovenia 45% repeat odds."
  },
  {
    id: 'SNOW-1',
    sport: 'Snowboarding',
    name: "Men's Halfpipe",
    gender: 'Men',
    intel: "Japan's Ayumu Hirano (2014/2018/2022 medalist) legend. USA's Scotty James (AUS) won 2022 gold. Triple cork 1440 standard. Japanese halfpipe program dominant. Hirano's cab triple 1440 gives edge. James 50% gold odds."
  },
  {
    id: 'SNOW-2',
    sport: 'Snowboarding',
    name: "Men's Slopestyle",
    gender: 'Men',
    intel: "Canada's Max Parrot (2022 gold) and Mark McMorris lead. Rails + jumps format. Triple cork 1800 on jumps standard. Canadian slopestyle dynasty (5 Olympic golds). Weather-dependent event. Parrot 55% medal probability."
  },
  {
    id: 'SNOW-3',
    sport: 'Snowboarding',
    name: "Men's Big Air",
    gender: 'Men',
    intel: "Norway's Marcus Kleveland and USA's Chris Corning lead. Best 2 of 3 tricks format. Quad cork 1800 cutting edge (only 3 riders land it). Fall rate 50% attempting quads. High risk = high reward. Kleveland 45% gold odds."
  },
  {
    id: 'SNOW-4',
    sport: 'Snowboarding',
    name: "Men's Parallel Giant Slalom",
    gender: 'Men',
    intel: "Austria's Andreas Prommegger veteran threat. Head-to-head racing format. Alpine snowboard racing less popular than freestyle. Austrian alpine riders technical. Russia's absence opens medals. Austria 40% medal probability."
  },
  {
    id: 'SNOW-5',
    sport: 'Snowboarding',
    name: "Men's Snowboard Cross",
    gender: 'Men',
    intel: "Canada and Austria strong. 4-rider heats, contact racing. Crashes common (35% DNF). Alessandro Hämmerle (AUT) won 2022. Canadian program depth. Gate strategy critical. Hämmerle 45% repeat odds."
  },
  {
    id: 'SNOW-6',
    sport: 'Snowboarding',
    name: "Women's Halfpipe",
    gender: 'Women',
    intel: "USA's Chloe Kim is GOAT - 2018/2022 Olympic champion, undefeated since 2019. China's Cai Xuetong competitive. Kim's cab 1080 + backside 1080 combo unmatched. American halfpipe dominance. Kim 80% gold probability if competes."
  },
  {
    id: 'SNOW-7',
    sport: 'Snowboarding',
    name: "Women's Slopestyle",
    gender: 'Women',
    intel: "New Zealand's Zoi Sadowski-Synnott (2022 gold) defending. USA's Jamie Anderson (2014/2018 gold) chasing history. Women's triple cork 1260 now possible. Kiwi program surging. Anderson's experience vs Sadowski-Synnott's progression. NZL 55% gold odds."
  },
  {
    id: 'SNOW-8',
    sport: 'Snowboarding',
    name: "Women's Big Air",
    gender: 'Women',
    intel: "Austria's Anna Gasser (2022 gold) and New Zealand's Sadowski-Synnott lead. Women's cab triple 1440 cutting edge. Best 2 of 3 format rewards consistency. Austrian women strong in big air. Gasser 50% repeat odds."
  },
  {
    id: 'SNOW-9',
    sport: 'Snowboarding',
    name: "Women's Parallel Giant Slalom",
    gender: 'Women',
    intel: "Austria and Germany lead. Head-to-head alpine racing. Less popular discipline. Germany's Ramona Hofmeister strong. Austrian program depth. Germany 45% medal probability."
  },
  {
    id: 'SNOW-10',
    sport: 'Snowboarding',
    name: "Women's Snowboard Cross",
    gender: 'Women',
    intel: "USA's Lindsey Jacobellis (2022 gold) legend. France and Austria competitive. 4-woman heats, physical racing. Jacobellis's experience (age 40+) advantage. Crash rate 30%. USA 50% repeat odds."
  },
  {
    id: 'SNOW-11',
    sport: 'Snowboarding',
    name: "Mixed Team Snowboard Cross",
    gender: 'Mixed',
    intel: "USA won 2022 mixed team gold. Format: 1M + 1W, relay-style. Austria and Canada competitive. Team chemistry matters more than individual skill. USA depth in both genders. USA 55% repeat probability."
  },
  {
    id: 'SPEED-1',
    sport: 'Speed Skating',
    name: "Men's 500m",
    gender: 'Men',
    intel: "Norway's Håvard Lorentzen and Japan's Tatsuya Shinhama lead. Pure sprint - 35 seconds of explosive power. Inner lane has 0.02s advantage. Two races combined. Norwegian/Japanese sprint programs strong. Lorentzen 45% medal odds."
  },
  {
    id: 'SPEED-2',
    sport: 'Speed Skating',
    name: "Men's 1000m",
    gender: 'Men',
    intel: "Netherlands' Kjeld Nuis (2x Olympic 1500m champ) moving down distance. USA's Jordan Stolz rising star (World record holder). Dutch program depth. 1000m sweet spot - speed + endurance. Stolz 50% gold probability."
  },
  {
    id: 'SPEED-3',
    sport: 'Speed Skating',
    name: "Men's 1500m",
    gender: 'Men',
    intel: "Nuis (NED) defending 2018/2022 champion. Norway's Sander Eitrem competitive. 1500m most tactical distance. Dutch 1500m legacy (12 Olympic medals). Nuis chasing history (3-peat). Nuis 55% gold odds."
  },
  {
    id: 'SPEED-4',
    sport: 'Speed Skating',
    name: "Men's 5000m",
    gender: 'Men',
    intel: "Netherlands' Patrick Roest and Norway's Sverre Lunde Pedersen lead. Endurance event. Dutch distance skating dominance. Altitude training matters - clap skates + VO2 max. Roest 60% medal probability."
  },
  {
    id: 'SPEED-5',
    sport: 'Speed Skating',
    name: "Men's 10000m",
    gender: 'Men',
    intel: "Sweden's Nils van der Poel won 2022 gold with Olympic record. Retired. Opens field. Netherlands and Norway battle. 25-lap marathon requires pacing strategy. Dutch depth gives 70% medal rate."
  },
  {
    id: 'SPEED-6',
    sport: 'Speed Skating',
    name: "Men's Team Pursuit",
    gender: 'Men',
    intel: "Norway won 2022 gold. Format: 3-man teams, 8 laps. Drafting strategy critical. Dutch program historically dominant but Norway surging. Team synchronization practiced 500+ hours. Norway 55% repeat odds."
  },
  {
    id: 'SPEED-7',
    sport: 'Speed Skating',
    name: "Men's Mass Start",
    gender: 'Men',
    intel: "Chaotic race - all skaters start together. Belgium's Bart Swings (2022 gold) defending. Strategy: save energy until final 4 laps. Sprint finish decides medals. Pack tactics matter. Wide open race - 40% upset potential."
  },
  {
    id: 'SPEED-8',
    sport: 'Speed Skating',
    name: "Women's 500m",
    gender: 'Women',
    intel: "USA's Erin Jackson (2022 gold) defending. Japan's Nao Kodaira strong. Women's 500m pure power. Inner lane advantage. Jackson's start technique superior. USA 55% repeat odds."
  },
  {
    id: 'SPEED-9',
    sport: 'Speed Skating',
    name: "Women's 1000m",
    gender: 'Women',
    intel: "Japan's Miho Takagi (2022 gold) and Netherlands' Jutta Leerdam lead. 1000m requires explosive power + endurance. Dutch women 8 Olympic 1000m medals. Takagi 50% medal probability."
  },
  {
    id: 'SPEED-10',
    sport: 'Speed Skating',
    name: "Women's 1500m",
    gender: 'Women',
    intel: "Takagi won 2022. Netherlands' Antoinette Rijpma-de Jong competitive. 1500m tactical race. Japanese women improving rapidly. Dutch 1500m tradition deep. Takagi 55% gold odds."
  },
  {
    id: 'SPEED-11',
    sport: 'Speed Skating',
    name: "Women's 3000m",
    gender: 'Women',
    intel: "Netherlands' Irene Schouten (2022 3000m + 5000m champion) dominant. Czech Republic's Martina Sáblíková (6x Olympic medalist) veteran. Dutch distance program superior. Schouten 65% gold probability."
  },
  {
    id: 'SPEED-12',
    sport: 'Speed Skating',
    name: "Women's 5000m",
    gender: 'Women',
    intel: "Schouten (NED) defending. Sáblíková (CZE) chasing 7th Olympic medal. 5000m endurance test. Altitude training + clap skate tech. Dutch women won 7 of last 9 Olympic 5000m golds. Schouten 70% medal odds."
  },
  {
    id: 'SPEED-13',
    sport: 'Speed Skating',
    name: "Women's Team Pursuit",
    gender: 'Women',
    intel: "Netherlands won 2022 with Olympic record. Canadian women competitive. 3-woman teams, aerodynamic drafting. Dutch team synchronization perfect. Team pursuit Netherlands' signature event. Netherlands 75% gold probability."
  },
  {
    id: 'SPEED-14',
    sport: 'Speed Skating',
    name: "Women's Mass Start",
    gender: 'Women',
    intel: "Schouten (NED) won 2022 - triple gold medalist. All skaters start together, sprint finish. Pack racing tactics. Belgian Swings strategy applies. Schouten's distance base gives 4-lap advantage. Netherlands 60% gold odds."
  },
];

export const INITIAL_EVENTS: OlympicEvent[] = rawEvents.map(e => ({
  id: e.id,
  sport: e.sport,
  name: e.name,
  gender: e.gender as 'Men' | 'Women' | 'Mixed',
  type: (e.name.includes("Relay") || e.name.includes("Team") || e.name.includes("Hockey") || e.name.includes("Curling") || e.name.includes("Pairs") || e.name.includes("Doubles")) ? 'Team' : 'Individual',
  status: 'Scheduled',
  description: e.intel
}));
