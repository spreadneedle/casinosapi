const casinoData = [
  {
    casino_name: "Videoslots",
    bonus: "100% up to €200 + 11 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "no wagering requirement",
    free_spin_value: "€0.10/spin",
    info: "This is a 'wager first' bonus, where the bonus is paid out in 10% increments as the deposit is wagered",
    licenses: "Malta Gaming Authority, UK Gambling Commission, Swedish Gambling Authority, Alcohol and Gaming Commission of Ontario",
    updated: "2025-03-27"
  },
  {
    casino_name: "Boost Casino",
    bonus: "100% 250 € asti + 50 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "30x",
    free_spin_value: "€0.10/spin",
    info: "Deposited funds are used first. The bonus is 'non-sticky'.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-27"
  },
  {
    casino_name: "Pommi Casino",
    bonus: "n/a",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "Pommi Casino offers no sign-up bonus.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-27"
  },
  {
    casino_name: "Paratiisi Casino",
    bonus: "300 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "€0.10/spin",
    info: "100 free spins per day are handed out over 3 days.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-27"
  },
  {
    casino_name: "Bethard",
    bonus: "100% up to €50 + 20 free spins",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "10x",
    free_spin_value: "€0.20/spin",
    info: "",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "Shokki Casino",
    bonus: "n/a",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "Pommi Casino offers no sign-up bonus.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "Lucky Trunk Casino",
    bonus: "100% up to €250 + 50 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "Pommi Casino offers no sign-up bonus.",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-28"
  },
  {
    casino_name: "Hillo Casino",
    bonus: "100 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "50x",
    free_spin_value: "€0.20/spin",
    info: "50 free spins per day are handed out over 2 days.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "Teho Casino",
    bonus: "150% up to €600",
    wagering_requirement_bonus: "80x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "The bonus is 'sticky'.",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-28"
  },
  {
    casino_name: "Dazzlehand Casino",
    bonus: "100% up to €200 + 200 free spins",
    wagering_requirement_bonus: "60x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-28"
  },
  {
    casino_name: "21 Casino",
    bonus: "121% up to €300 + 21 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "The free spins are awarded on registration.",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-28"
  },
  {
    casino_name: "Wild Robin Casino",
    bonus: "100% up to €500 + 200 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 10 days.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "RX Casino",
    bonus: "150% up to €5000",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "The max win from the bonus is 3x the bonus value.",
    licenses: "Curacao Gaming Control Board, Anjouan Gaming",
    updated: "2025-03-28"
  },
  {
    casino_name: "Kaahaus Casino",
    bonus: "100 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "0x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "Betizy Casino",
    bonus: "100% up to €250 + 50 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-28"
  },
  {
    casino_name: "Slot it Casino",
    bonus: "100% up to €500",
    wagering_requirement_bonus: "36x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "Casumo Casino",
    bonus: "100% up to €300 + 20 free spins",
    wagering_requirement_bonus: "60x",
    wagering_requirement_free_spins: "30x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "H.M. Government of Gibraltar",
    updated: "2025-03-28"
  },
  {
    casino_name: "Lunubet Casino",
    bonus: "100% up to €500 + 200 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 10 days.",
    licenses: "Anjouan Gaming",
    updated: "2025-03-28"
  },
  {
    casino_name: "Epicbet Casino",
    bonus: "Up to €300",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "This is a 'wager first' bonus where €10 is handed out for every €400 wagered up to a max of €300 in total.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-28"
  },
  {
    casino_name: "Saletti Casino",
    bonus: "100% up to €500 + 50 free spins",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-28"
  },
  {
    casino_name: "Possu Casino",
    bonus: "n/a",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-29"
  },
  {
    casino_name: "Winz.io Casino",
    bonus: "n/a",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-29"
  },
  {
    casino_name: "Reipas Casino",
    bonus: "100% up to €500 + 50 free spins",
    wagering_requirement_bonus: "80x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.25/spin",
    info: "Max win from free spins €20.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-29"
  },
  {
    casino_name: "Kingpalace Casino",
    bonus: "100% up to €2000 + 200 free spins",
    wagering_requirement_bonus: "60x",
    wagering_requirement_free_spins: "30x",
    free_spin_value: "€0.10/spin",
    info: "The first deposit bonus depends on the deposit amount. A €20 deposit will give 200% bonus up to €50 with a 50x wagering requirement. A €50 deposit will give 150% bonus up to €350 with a 40x wagering requirement. A €500 deposit will give 100% up to €2000 with a 60x wagering requirement.",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-29"
  },
  {
    casino_name: "Arctic Casino",
    bonus: "10 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€1/spin",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-29"
  },
  {
    casino_name: "Lucky Nordic Casino",
    bonus: "50 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "0x",
    free_spin_value: "€1/spin",
    info: "The spin value of the free spins depend on the first deposit amount. A €20 deposit gives a €0.10 spin value. A €100 deposit gives a €0.50 spin value. A €200 deposit gives a €1 spin value.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-29"
  },
  {
    casino_name: "Fruta Casino",
    bonus: "200 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "0x",
    free_spin_value: "€0.20/spin",
    info: "200 free spins per day are handed out over 4 days in different games where the spin value ranges from €0.10 to €0.20.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-29"
   },
   {
    casino_name: "Dynabet Casino",
    bonus: "100% up to €2000",
    wagering_requirement_bonus: "30x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-29"
   }, 
   {
    casino_name: "Budsino Casino",
    bonus: "100% up to €100",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Highroller Casino",
    bonus: "200 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "0x",
    free_spin_value: "€0.20/spin",
    info: "200 free spins per day are handed out over 10 days in different games where the spin value ranges from €0.10 to €0.20.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Taika Spins Casino",
    bonus: "100% up to €250 + 50 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Casino Vice",
    bonus: "100% up to €500 + 125 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.20/spin",
    info: "125 free spins per day are handed out over 5 days in different games.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Fat Pirate Casino",
    bonus: "100% up to €500 + 200 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "125 free spins per day are handed out over 5 days in different games.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Qbet Casino",
    bonus: "10 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€1/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Trust Dice Win Casino",
    bonus: "200% up to €30000 + 20 free spins",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Casino Joy",
    bonus: "200% up to €1000 + 100 free spins",
    wagering_requirement_bonus: "80x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Wildsino Casino",
    bonus: "100% up to €1000 + 300 free spins",
    wagering_requirement_bonus: "80x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Anjouan Gaming",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Be On Bet Casino",
    bonus: "150% up to €450 + 100 free spins",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Be On Bet Casino",
    bonus: "100% up to €250 + 50 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Bet Label Casino",
    bonus: "100% up to €300 + 30 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "PrimeBetz Casino",
    bonus: "100% up to €500 + 100 free spins",
    wagering_requirement_bonus: "50x",
    wagering_requirement_free_spins: "50x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 5 days in different games.",
    licenses: "Kahnawake Gaming Commission",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Paripesa Casino",
    bonus: "100% up to €300 + 30 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 5 days in different games.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Betrix Casino",
    bonus: "100% up to €250 + 50 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 5 days in different games.",
    licenses: "Malta Gaming Authority",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "AllySpin Casino",
    bonus: "100% up to €500",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Anjouan Gaming",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Spinaro Casino",
    bonus: "100% up to €1000 + 50 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Anjouan Gaming",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Impressario Casino",
    bonus: "100% up to €1000 + 100 free spins",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Kahnawake Gaming Commission",
    updated: "2025-03-30"
   }, 
   {
    casino_name: "Trivelabet Casino",
    bonus: "200% up to €1000",
    wagering_requirement_bonus: "30x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Magius Casino",
    bonus: "100% up to €500 + 200 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 10 days in different games.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Fun Bet Casino",
    bonus: "100% up to €500 + 200 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 10 days in different games.",
    licenses: "n/a",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Hotbet Casino",
    bonus: "100% up to €200",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "n/a",
    licenses: "n/a",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Casino Vibes",
    bonus: "100% up to €300 + 50 free spins",
    wagering_requirement_bonus: "35x",
    wagering_requirement_free_spins: "35x",
    free_spin_value: "€0.10/spin",
    info: "n/a",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Gemobet Casino",
    bonus: "100 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "30x",
    free_spin_value: "€0.10/spin",
    info: "20 free spins per day are handed out over 5 days.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Tuohi Casino",
    bonus: "n/a",
    wagering_requirement_bonus: "0x",
    wagering_requirement_free_spins: "0x",
    free_spin_value: "n/a",
    info: "The first deposit awards 1 spin on a prize wheel. No guaranteed wins but a max win of €5000.",
    licenses: "Gambling Supervision Commission Isle of Man",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Pelikioski Casino",
    bonus: "n/a",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "The first deposit awards a mystery prize. No guaranteed wins but a max win of €500.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "Zip Casino",
    bonus: "100% up to €1000 + 50 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "n/a",
    licenses: "Anjouan Gaming",
    updated: "2025-03-31"
   }, 
   {
    casino_name: "NetBet Casino",
    bonus: "100% up to €500 + 500 free spins",
    wagering_requirement_bonus: "30x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.05/spin",
    info: "500 free spins are handed out in varying amounts over 7 days, with 50 on day one.",
    licenses: "Malta Gaming Authority",
    updated: "2025-04-01"
   }, 
   {
    casino_name: "Spin247 Casino",
    bonus: "100% up to €500 + 200 free spins",
    wagering_requirement_bonus: "70x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.05/spin",
    info: "200 free spins are handed out in amounts of 20 spins per day over a span of 10 days.",
    licenses: "Anjouan Gaming",
    updated: "2025-04-01"
   }, 
   {
    casino_name: "Huikee Casino",
    bonus: "150% up to €400 + 50 free spins",
    wagering_requirement_bonus: "80x",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€0.20/spin",
    info: "200 free spins are handed out in amounts of 20 spins per day over a span of 10 days.",
    licenses: "Malta Gaming Authority",
    updated: "2025-04-01"
   }, 
   {
    casino_name: "ReSpin Casino",
    bonus: "Up to €300",
    wagering_requirement_bonus: "40x",
    wagering_requirement_free_spins: "n/a",
    free_spin_value: "n/a",
    info: "This is a 'wager first' bonus where €10 is handed out for every €400 wagered up to a max of €300 in total.",
    licenses: "Estonian Tax and Customs Board",
    updated: "2025-04-02"
   }, 
   {
    casino_name: "Slotti Casino",
    bonus: "100 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "50x",
    free_spin_value: "€0.20/spin",
    info: "100 free spins are handed out in batches of 50 on the first day, 25 free spins on the second day, and 25 free spins on the third day.",
    licenses: "Curacao Gaming Control Board",
    updated: "2025-04-02"
   }, 
   {
    casino_name: "iBet Casino",
    bonus: "10 free spins",
    wagering_requirement_bonus: "n/a",
    wagering_requirement_free_spins: "40x",
    free_spin_value: "€1/spin",
    info: "n/a",
    licenses: "Malta Gaming Authority",
    updated: "2025-04-02"
   }, 
  
      
];

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const location = req.query.location;
  
  if (!location) {
    return res.status(400).json({ error: 'Location parameter is required' });
  }

  const filteredCasinos = casinoData.filter(casino => 
    casino.geo.toLowerCase() === location.toLowerCase()
  );
  
  res.status(200).json(filteredCasinos);
} 
