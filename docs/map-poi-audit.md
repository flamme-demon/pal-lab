# Outdoor map coverage audit

The map manifest was audited against the placed world-partition actors and data tables in a local Palworld installation, Steam build **25246127**. The extractor scans every `MainWorld_5` cell, including the World Tree, and records its game build and mapping-file hash.

## Added categories

`--export-extra-map` extends the existing manifest with `poi_categories` and `points_of_interest`. Each category has its own persistent filter and active-map count. Observation towers, dungeons and ancient shrines are visible by default; optional resources, loot and activities can be enabled separately. Four of the 47 skill-fruit actors are internal dungeon placements; the exterior layer contains 43 trees. Dense optional layers are grouped in screen-space cells, with their complete location counts retained. Zooming in separates nearby locations.

| Category | Palpagos | World Tree | Total |
| --- | ---: | ---: | ---: |
| Observation towers | 20 | 2 | 22 |
| Dungeons | 170 | 0 | 170 |
| Sealed realms | 18 | 0 | 18 |
| Oil rigs | 3 | 0 | 3 |
| Arena | 1 | 0 | 1 |
| Teleportation altars | 21 | 1 | 22 |
| Statues of Power | 4 | 0 | 4 |
| Healing springs | 0 | 3 | 3 |
| Wildlife sanctuaries | 3 | 0 | 3 |
| Starting points | 8 | 0 | 8 |
| Ancient lava deposits | 10 | 0 | 10 |
| Wild Palbox | 1 | 0 | 1 |
| Ancient shrines | 106 | 0 | 106 |
| Journals | 55 | 9 | 64 |
| Treasure map locations | 42 | 0 | 42 |
| Skill fruit trees | 31 | 12 | 43 |
| Ore deposits | 1594 | 0 | 1594 |
| Coal deposits | 520 | 0 | 520 |
| Sulfur deposits | 280 | 0 | 280 |
| Pure quartz deposits | 523 | 0 | 523 |
| Stone deposits | 8046 | 0 | 8046 |
| Paldium deposits | 1173 | 0 | 1173 |
| Nightstar sand | 271 | 0 | 271 |
| Hexolite quartz deposits | 349 | 0 | 349 |
| Soralite deposits | 208 | 0 | 208 |
| Paloxite deposits | 0 | 80 | 80 |
| Crude oil fields | 185 | 0 | 185 |
| Wild food and plants | 2308 | 0 | 2308 |
| Loose materials | 8950 | 0 | 8950 |
| Treasure chests and loot | 9232 | 728 | 9960 |
| Wild eggs | 1787 | 30 | 1817 |
| Junk piles | 646 | 24 | 670 |
| Fishing spots | 500 | 77 | 577 |
| Merchants | 27 | 0 | 27 |
| NPCs and quests | 152 | 3 | 155 |
| Enemy camps | 59 | 0 | 59 |

Existing categories remain available: 407 effigies, 152 fast-travel statues, 90 Alpha locations, 33 wanted targets, 13 boss tower/arena landmarks, wild species spawn overlays, player bases, players and custom markers.

## Exact save joins

- Observation towers: actor `LevelObjectInstanceId` in UE-Digits format against `FastTravelPointUnlockFlag`.
- Ancient shrines: the same actor GUID format against `ItemPickupObtainForInstanceFlag`.
- Journals: actor `NoteRowName.Key` against `NoteObtainForInstanceFlag`. Journal flags contain note row IDs, **not actor GUIDs**.

Only true flags count. Gray pins and found/total counters respect the selected player or union of all players and the active map. Missing record fields remain neutral. Dungeon/global clear totals, NPC interactions and aggregate event statistics are not treated as permanent per-location completion. Existing boss tower reachability continues to use its documented region-reached contract.

## Placement and coverage boundaries

Attached components store local coordinates. The extractor resolves every parent transform, including scale and Unreal pitch/yaw/roll, before publishing world positions. Translation, rotation, nonuniform scale and nested-parent calculations are checked by `--check-map-transforms`.

The world package also contains dungeon and combat arena templates tens of thousands of units below the exterior. These internal scenes are excluded (`Z < -20,000`), along with dungeon-only fishing/shop actors, decorative child towers, duplicate placements and destination-only portal actors. The published manifest has **38,272 additional exterior locations in 36 categories**. A complete actor-class inventory and read-only property audit are available through `--audit-map-pois`.

Resources, eggs, chests, loot, fishing and merchant locations identify potential spawn sites. They do not guarantee that an object or NPC is currently present. Underground chromite, meteorite/supply drops, roaming encounters and other runtime placements are not assigned invented fixed coordinates. Dungeon opening/respawn state and quest-phase availability are not inferred from static actors. Player-constructed objects are represented by the existing save-based base layer rather than static game placements. Terrain meshes, vegetation decoration, lights, volumes and interior encounter components are not gameplay POI pins.

Names, journal headings and icon references come from the game's own English/French localization, item, NPC and blueprint tables. Resource identity was checked against blueprint item drops: `NightStone` means **Nightstar Sand**, `DamagableRock0003` drops **Pure Quartz**, `DamagableRock0019` drops **Hexolite Quartz**, and `DamagableRock0022` drops **Ancient Lava**.

## Reproducing extraction

After extracting the base map for the same installed build:

```sh
dotnet run --project tools/pal-extract -- --check-map-transforms
dotnet run --project tools/pal-extract -- --audit-map-pois
dotnet run --project tools/pal-extract -- --export-extra-map
dotnet run --project tools/pal-extract -- --export-map-icons
```

Set `PALCALC_GAME_BUILD`, `PALCALC_PALWORLD_PAKS` and `PALCALC_MAPPINGS_USMAP` for your installation. `--export-extra-map` refuses to combine different game builds and validates the key landmark/collectible counts before publishing. Probe dumps and private saves are not required or included in distributed releases.
