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
