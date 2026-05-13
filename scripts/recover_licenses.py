#!/usr/bin/env python3
"""
Recover license data from old bonus.js and merge into current bonus_enhanced.js
"""

import json
import re

# License ID mapping from old bonus.js
LICENSE_MAP = {
    1: "MGA",
    2: "Curacao", 
    3: "Gibraltar",
    4: "Kahnawake",
    5: "Isle of Man",
    6: "Alderney",
    7: "Antigua and Barbuda",
    8: "UKGC",
    9: "USA_State",
    10: "USA_State",
    11: "USA_State",
    12: "USA_State",
    13: "USA_State",
    14: "USA_State",
    15: "USA_State",
    16: "Spelinspektionen",
    17: "Spelinspektionen",
    18: "Italy",
    19: "Spain",
    20: "France",
    21: "Netherlands",
    22: "Belgium",
    23: "Germany",
    24: "Greece",
    25: "Portugal",
    26: "Romania",
    27: "Colombia",
    28: "Philippines",
    29: "Kenya",
    30: "Nigeria",
    31: "Estonian",
    32: "Latvia",
    33: "Lithuania",
    34: "Czech Republic",
    35: "Slovakia",
    36: "Switzerland",
    37: "Ukraine",
    38: "Belarus",
    39: "Georgia",
    40: "Armenia",
    41: "Serbia",
    42: "Montenegro",
    43: "Hungary",
    44: "Tanzania",
    45: "Ghana",
    46: "Barbados",
    47: "Jamaica",
    48: "Sierra Leone",
    49: "Panama",
    50: "Peru",
    51: "Argentina",
    52: "Argentina",
    53: "Costa Rica",
    54: "Anjouan",
}

# Old license data from git commit 4563661
OLD_LICENSES = {
    "21 Casino": [1, 8],
    "AllySpin Casino": [54],
    "Arctic Casino": [1],
    "Bally Bet Casino, USA": [9, 10],
    "BassBet Casino": [54],
    "Be On Bet Casino": [2],
    "Bet Label Casino": [2],
    "Bet365, USA": [9, 10],
    "BetMGM, USA": [9, 10],
    "BetRivers Casino, USA": [9, 10],
    "Bethard": [2],
    "Betizy Casino": [1],
    "Betrix Casino": [1],
    "Boost Casino": [31],
    "Borgata Online Casino, USA": [9, 10],
    "Budsino Casino": [1],
    "Caesars Palace Online Casino, USA": [9, 10],
    "Casino Joy": [2],
    "Casino Vice": [2],
    "Casumo Casino": [3],
    "Dazzlehand Casino": [1],
    "DraftKings Casino, USA": [9, 10],
    "Dynabet Casino": [2],
    "Epicbet Casino": [31],
    "FanDuel Casino, USA": [9, 10],
    "Fanatics Casino, USA": [9],
    "Fat Pirate Casino": [2],
    "Fruta Casino": [31],
    "Fun Bet Casino": [2],
    "Gemobet Casino": [2],
    "Golden Nugget Casino, USA": [9, 10],
    "Hard Rock Bet, USA": [9],
    "Highroller Casino": [31],
    "Hillo Casino": [31],
    "Horseshoe Casino, USA": [9],
    "Huikee Casino": [1],
    "Impressario Casino": [4],
    "Jackpot City Casino, USA": [9],
    "Kaahaus Casino": [2],
    "Kingpalace Casino": [1],
    "Kruuna Casino": [1],
    "Legiano Casino": [54],
    "Lucky Nordic Casino": [31],
    "Lucky Trunk Casino": [1],
    "Lunubet Casino": [54],
    "Lysti Casino": [2],
    "Magius Casino": [31],
    "Mammona Casino": [1],
    "Monopoly Casino, USA": [9],
    "Mr Punter": [54],
    "N1 Casino": [1],
    "NetBet Casino": [1],
    "Ninja Casino": [1],
    "Paratiisi Casino": [2],
    "Paripesa Casino": [2],
    "PartyCasino, USA": [9, 10],
    "Pelikioski Casino": [31],
    "Pistolo Casino": [54],
    "PlayStar Casino, USA": [9],
    "Pommi Casino": [2],
    "Possu Casino": [2],
    "Power Up Casino": [54],
    "PrimeBetz Casino": [4],
    "Qbet Casino": [2],
    "RX Casino": [2, 54],
    "ReSpin Casino": [31],
    "Reipas Casino": [2],
    "Roby Casino": [54],
    "Saletti Casino": [1],
    "Shokki Casino": [2],
    "Slot it Casino": [2],
    "Slotti Casino": [2],
    "Spin Palace, USA": [9, 10],
    "Spin247 Casino": [54],
    "Spinaro Casino": [54],
    "Spinfest Casino": [2],
    "Taika Spins Casino": [1],
    "Teho Casino": [1],
    "Trivelabet Casino": [31],
    "Trust Dice Win Casino": [2],
    "Tuohi Casino": [5],
    "Videoslots": [1, 8, 16, 17, 15],
    "Wheel of Fortune Casino, USA": [9],
    "Wheelz Casino": [1],
    "Wild Robin Casino": [2],
    "Wildsino Casino": [54],
    "Winz.io Casino": [2],
    "Zip Casino": [54],
    "iBet Casino": [1],
}

# Known licenses for casinos that can be inferred
KNOWN_LICENSES = {
    # MGA licensed (known operators)
    "Playzee Casino": ["MGA"],
    "Casoola Casino": ["MGA"],
    "Caxino Casino": ["MGA"],  # Rootz platform
    "Simple Casino": ["MGA"],  # Hero Gaming
    "Jackpot Village Casino": ["MGA"],  # White Hat Gaming
    "CasinoCasino.com": ["MGA", "UKGC", "Spelinspektionen"],  # L&L Europe
    "Boom Casino": ["Estonian"],  # PayNPlay
    "Pelataan Kasino": ["MGA"],  # Rootz
    
    # Crypto casinos
    "Bitcasino.io": ["Curacao"],
    "Sportsbet.io": ["Curacao"],
    "Stake.com": ["Curacao"],
    "Duelbits": ["Curacao"],
    
    # USA
    "Eagle Casino & Sports": ["USA_State"],
    
    # Others that can be inferred from info text
    "Spin Casino": ["MGA"],  # Bayton Ltd
    "Miami Dice Casino": ["MGA", "UKGC"],  # White Hat Gaming
    "Red Dice": ["MGA"],  # Rootz
}

def convert_old_to_new(old_ids):
    """Convert old numeric IDs to license names"""
    licenses = []
    for lid in old_ids:
        if lid in LICENSE_MAP:
            license_name = LICENSE_MAP[lid]
            if license_name not in licenses:
                licenses.append(license_name)
    return licenses

def main():
    # Read current enhanced data
    with open('/home/icem/.openclaw/workspace/grokcasino/api/bonus_enhanced.js', 'r') as f:
        content = f.read()
    
    start = content.find('[')
    end = content.rfind(']') + 1
    casinos = json.loads(content[start:end])
    
    # Track stats
    recovered = 0
    already_had = 0
    need_research = []
    
    for casino in casinos:
        name = casino['casino_name']
        
        # Skip if already has license field
        if 'license' in casino:
            already_had += 1
            continue
        
        # Try to recover from old data
        if name in OLD_LICENSES:
            old_ids = OLD_LICENSES[name]
            casino['license'] = convert_old_to_new(old_ids)
            recovered += 1
            continue
        
        # Try known inferences
        if name in KNOWN_LICENSES:
            casino['license'] = KNOWN_LICENSES[name]
            recovered += 1
            continue
        
        # Try to extract from info/ai_summary text
        text = str(casino.get('info', '')) + ' ' + str(casino.get('ai_summary', ''))
        extracted = []
        if 'MGA' in text or 'Malta Gaming Authority' in text:
            extracted.append('MGA')
        if 'Curaçao' in text or 'Curacao' in text:
            extracted.append('Curacao')
        if 'UK Gambling Commission' in text or 'UKGC' in text:
            extracted.append('UKGC')
        if 'Spelinspektionen' in text or 'Swedish Gambling Authority' in text:
            extracted.append('Spelinspektionen')
        if 'Estonian' in text or 'Estonia' in text:
            extracted.append('Estonian')
        if 'offshore' in text.lower():
            extracted.append('Curacao')
        
        if extracted:
            casino['license'] = extracted
            recovered += 1
            continue
        
        # Mark for research
        need_research.append(name)
    
    # Write updated data
    output = '// Enhanced CasinosAPI API - AI-Optimized Data\n'
    output += f'// Generated: 2026-05-13T{datetime_now()}Z\n'
    output += f'// Casinos: {len(casinos)}\n\n'
    output += 'const casinoDataEnhanced = ' + json.dumps(casinos, indent=2, ensure_ascii=False) + ';\n\n'
    output += 'module.exports = { default: casinoDataEnhanced };\n'
    output += 'module.exports.default = casinoDataEnhanced;\n'
    
    with open('/home/icem/.openclaw/workspace/grokcasino/api/bonus_enhanced.js', 'w') as f:
        f.write(output)
    
    print(f"Recovered: {recovered}")
    print(f"Already had: {already_had}")
    print(f"Need research: {len(need_research)}")
    print("\nCasinos needing license research:")
    for name in sorted(need_research):
        print(f"  - {name}")

def datetime_now():
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).strftime('%H:%M:%S')

if __name__ == '__main__':
    main()
