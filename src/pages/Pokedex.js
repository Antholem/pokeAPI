import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { Card, CardContent, Stack, Typography, Grid, Box } from '@mui/material';
import { grey, green, yellow, blue, brown, pink, purple, red, blueGrey } from '@mui/material/colors';
import useStore from '../Store';
import Scale from '../animations/Scale';
import Sort from '../components/SortButton';
import NoItem from '../components/Placeholder';
import SearchBar from '../components/Textfield';
import SelectItem from '../components/SelectItem';
import Loading from '../components/Loading';
import Pokemon from '../components/Other';
import PokeModal from '../components/PokedexModal';

function Pokedex() {
  const { mode, shiny, sprites, render } = useStore();
  const [pokemonList, setPokemonList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState(localStorage.getItem('sortOrder') || 'asc');
  const [searchText, setSearchText] = useState('');
  const [selectedType1, setSelectedType1] = useState(localStorage.getItem('selectedType1') || 'Any');
  const [selectedType2, setSelectedType2] = useState(localStorage.getItem('selectedType2') || 'Any');
  const [selectedGen, setSelectedGen] = useState(localStorage.getItem('selectedGen') || 'generation-i');
  const [selectedStat, setSelectedStat] = useState(localStorage.getItem('selectedStat') || 'id');

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon?limit=${render}&offset=0`);
        const data = response.data.results;

        const formattedPokemonList = await Promise.all(
          data.map(async (pokemon) => {
            const res = await axios.get(pokemon.url);
            const pokemonData = res.data;

            // Fetching generation information
            const speciesResponse = await axios.get(pokemonData.species.url);
            const speciesData = speciesResponse.data;
            const generationUrl = speciesResponse.data.generation.url;
            const generationResponse = await axios.get(generationUrl);
            const generation = generationResponse.data.name;

            // Fetching color information
            const colorResponse = await axios.get(pokemonData.species.url);
            const color = colorResponse.data.color.name;

            // Fetching abilities information
            const abilities = pokemonData.abilities.map((ability) => ability.ability.name);

            // Fetching growth-rate information
            const fetchGrowthRate = async (speciesData) => {
              const growthRateUrl = speciesData.growth_rate.url;
              const growthRateResponse = await axios.get(growthRateUrl);
              const growthRate = growthRateResponse.data.name;
              return growthRate;
            };

            // Fetching habitat information
            const fetchHabitat = async (speciesData) => {
              const habitatUrl = speciesData.habitat.url;
              const habitatResponse = await axios.get(habitatUrl);
              const habitat = habitatResponse.data.name;
              return habitat;
            };

            // Fetching shape information
            const fetchShape = async (speciesData) => {
              const shapeUrl = speciesData.shape.url;
              const shapeResponse = await axios.get(shapeUrl);
              const shape = shapeResponse.data.name;
              return shape;
            };

            // Fetching legendary status
            const fetchLegendaryStatus = async (speciesData) => {
              const isLegendary = speciesData.is_legendary;
              return isLegendary;
            };

            // Fetching mythical status
            const fetchMythicalStatus = async (speciesData) => {
              const isMythical = speciesData.is_mythical;
              return isMythical;
            };

            const formattedPokemonData = {
              sprites: {
                front_default:
                  shiny ? (
                    sprites === 'home' ? pokemonData.sprites.other['home'].front_shiny :
                      sprites === 'official-artwork' ? pokemonData.sprites.other['official-artwork'].front_shiny :
                        pokemonData.sprites.front_shiny
                  ) : (
                    sprites === 'home' ? pokemonData.sprites.other['home'].front_default :
                      sprites === 'official-artwork' ? pokemonData.sprites.other['official-artwork'].front_default :
                        pokemonData.sprites.front_default
                  ),
              },
              id: pokemonData.id,
              name: pokemonData.name,
              types: pokemonData.types,
              generation: generation,
              color: color,
              hp: pokemonData.stats.find((stat) => stat.stat.name === 'hp').base_stat,
              atk: pokemonData.stats.find((stat) => stat.stat.name === 'attack').base_stat,
              def: pokemonData.stats.find((stat) => stat.stat.name === 'defense').base_stat,
              specialAttack: pokemonData.stats.find((stat) => stat.stat.name === 'special-attack').base_stat,
              specialDefense: pokemonData.stats.find((stat) => stat.stat.name === 'special-defense').base_stat,
              speed: pokemonData.stats.find((stat) => stat.stat.name === 'speed').base_stat,
              total: pokemonData.stats.reduce((total, stat) => total + stat.base_stat, 0),
              weight: pokemonData.weight,
              height: pokemonData.height,
              abilities: abilities,
              growthRate: await fetchGrowthRate(speciesData),
              eggGroups: speciesData.egg_groups,
              habitat: await fetchHabitat(speciesData),
              shape: await fetchShape(speciesData),
              is_legendary: await fetchLegendaryStatus(speciesData),
              is_mythical: await fetchMythicalStatus(speciesData),
            };
            return formattedPokemonData;
          })
        );

        // Sort the list based on the selected stat
        const sortedList = [...formattedPokemonList].sort((a, b) => {
          if (sortOrder === 'asc') {
            return a[selectedStat] - b[selectedStat]; // Ascending order
          } else {
            return b[selectedStat] - a[selectedStat]; // Descending order
          }
        });

        setPokemonList(sortedList);
        setIsLoading(false);
      } catch (error) {
        console.log(error);
      }

      // Save state values to localStorage
      localStorage.setItem('sortOrder', sortOrder);
      localStorage.setItem('selectedType1', selectedType1);
      localStorage.setItem('selectedType2', selectedType2);
      localStorage.setItem('selectedGen', selectedGen);
      localStorage.setItem('selectedStat', selectedStat);
    };

    fetchPokemonData();
  }, [selectedStat]);

  const getColor = (color) => {
    const pokemonColorCard = {
      black: mode === 'dark' ? grey[900] : grey[800], ////
      blue: mode === 'dark' ? blue[900] : blue[200], ////
      brown: mode === 'dark' ? brown[900] : brown[200], ////
      gray: mode === 'dark' ? blueGrey[900] : blueGrey[200], ////
      green: mode === 'dark' ? green[900] : green[200], ////
      pink: mode === 'dark' ? pink[400] : pink[100], //
      purple: mode === 'dark' ? purple[900] : purple[200], //
      red: mode === 'dark' ? red[900] : red[200], ////
      white: mode === 'dark' ? grey[300] : grey[50],
      yellow: mode === 'dark' ? yellow[800] : yellow[200], //
    };

    const pokemonColorImage = {
      black: mode === 'dark' ? grey[800] : grey[900], ////
      blue: mode === 'dark' ? blue[300] : blue[500], ////
      brown: mode === 'dark' ? brown[300] : brown[500], ////
      gray: mode === 'dark' ? blueGrey[500] : blueGrey[500], ////
      green: mode === 'dark' ? green[300] : green[500], ////
      pink: mode === 'dark' ? pink[100] : pink[400], //
      purple: mode === 'dark' ? purple[200] : purple[400], //
      red: mode === 'dark' ? red[300] : red[500], ////
      white: mode === 'dark' ? grey[50] : grey[300], //
      yellow: mode === 'dark' ? yellow[200] : yellow[500], //
    };

    return {
      cardBackground: pokemonColorCard[color] || '',
      imageBackground: pokemonColorImage[color] || '',
    };
  };

  const pokemonType = [
    { name: 'Bug', value: 'bug' },
    { name: 'Dark', value: 'dark' },
    { name: 'Dragon', value: 'dragon' },
    { name: 'Electric', value: 'electric' },
    { name: 'Fairy', value: 'fairy' },
    { name: 'Fighting', value: 'fighting' },
    { name: 'Fire', value: 'fire' },
    { name: 'Flying', value: 'flying' },
    { name: 'Ghost', value: 'ghost' },
    { name: 'Grass', value: 'grass' },
    { name: 'Ground', value: 'ground' },
    { name: 'Ice', value: 'ice' },
    { name: 'Normal', value: 'normal' },
    { name: 'Poison', value: 'poison' },
    { name: 'Psychic', value: 'psychic' },
    { name: 'Rock', value: 'rock' },
    { name: 'Steel', value: 'steel' },
    { name: 'Water', value: 'water' },
  ];

  const defaultSprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/';
  const shinySprite = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/';

  const pokemonGen = [
    { name: 'All Gen', value: 'All' },
    { name: 'Gen I', value: 'generation-i', icon: shiny ? `${shinySprite}1.png` : `${defaultSprite}1.png` },
    { name: 'Gen II', value: 'generation-ii', icon: shiny ? `${shinySprite}155.png` : `${defaultSprite}155.png` },
    { name: 'Gen III', value: 'generation-iii', icon: shiny ? `${shinySprite}255.png` : `${defaultSprite}255.png` },
    { name: 'Gen IV', value: 'generation-iv', icon: shiny ? `${shinySprite}387.png` : `${defaultSprite}387.png` },
    { name: 'Gen V', value: 'generation-v', icon: shiny ? `${shinySprite}501.png` : `${defaultSprite}501.png` },
    { name: 'Gen VI', value: 'generation-vi', icon: shiny ? `${shinySprite}656.png` : `${defaultSprite}656.png` },
    { name: 'Gen VII', value: 'generation-vii', icon: shiny ? `${shinySprite}728.png` : `${defaultSprite}728.png` },
    { name: 'Gen VIII', value: 'generation-viii', icon: shiny ? `${shinySprite}816.png` : `${defaultSprite}816.png` },
    { name: 'Gen IX', value: 'generation-ix', icon: shiny ? `${shinySprite}172.png` : `${defaultSprite}172.png` },
  ];

  const pokemonStat = [
    { name: 'ID', value: 'id' },
    { name: 'HP', value: 'hp' },
    { name: 'ATK', value: 'atk' },
    { name: 'DEF', value: 'def' },
    { name: 'S.ATK', value: 'specialAttack' },
    { name: 'S.DEF', value: 'specialDefense' },
    { name: 'SPEED', value: 'speed' },
    { name: 'TOTAL', value: 'total' },
    { name: 'HT', value: 'height' },
    { name: 'WGT', value: 'weight' }
  ];

  const sortPokemonList = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newSortOrder); // Update sortOrder state

    const sortedList = [...filteredPokemonList].sort((a, b) => {
      if (newSortOrder === 'asc') {
        return a[selectedStat] - b[selectedStat]; // Ascending order
      } else {
        return b[selectedStat] - a[selectedStat]; // Descending order
      }
    });
    setPokemonList(sortedList);

    // Save sortOrder to localStorage
    localStorage.setItem('sortOrder', newSortOrder);
  };

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleType1Change = (event) => {
    setSelectedType1(event.target.value);

    // Save selectedType1 to localStorage
    localStorage.setItem('selectedType1', event.target.value);
  };

  const handleType2Change = (event) => {
    setSelectedType2(event.target.value);

    // Save selectedType2 to localStorage
    localStorage.setItem('selectedType2', event.target.value);
  };

  const handleGenChange = (event) => {
    setSelectedGen(event.target.value);

    // Save selectedGen to localStorage
    localStorage.setItem('selectedGen', event.target.value);
  };

  const handleStatChange = (event) => {
    setSelectedStat(event.target.value)

    // Save selectedStat to localStorage
    localStorage.setItem('selectedStat', event.target.value);
  }

  const clearSearchText = () => {
    setSearchText('');
  };

  const filteredPokemonList = pokemonList.filter((pokemon) => {
    // Filter based on search text
    if (searchText !== '' && !pokemon.name.toLowerCase().includes(searchText.toLowerCase())) {
      return false;
    }

    // Filter based on type 1
    if (selectedType1 !== 'Any' && !pokemon.types.find((type) => type.type.name === selectedType1)) {
      return false;
    }

    // Filter based on type 2
    if (selectedType2 !== 'Any' && !pokemon.types.find((type) => type.type.name === selectedType2)) {
      return false;
    }

    // Filter based on generation
    if (selectedGen !== 'All' && pokemon.generation !== selectedGen) {
      return false;
    }

    return true;
  });

  return (
    <Fragment>
      <Box sx={{ padding: '16px' }}>
        <Grid container sx={{ marginBottom: '16px' }} spacing={1}>
          <Grid item>
            <Sort onClick={sortPokemonList} sortOrder={sortOrder}/>
          </Grid>
          <Grid item>
            <SearchBar value={searchText} onChange={handleSearchTextChange} searchText={searchText} onClick={clearSearchText}/>
          </Grid>
          <Grid item>
            <SelectItem.SelectType value={selectedType1} onChange={handleType1Change} map={pokemonType}/>
          </Grid>
          <Grid item>
            <SelectItem.SelectType value={selectedType2} onChange={handleType2Change} map={pokemonType}/>
          </Grid>
          <Grid item>
            <SelectItem.SelectGenaration value={selectedGen} onChange={handleGenChange} map={pokemonGen}/>
          </Grid>
          <Grid item>
            <SelectItem.SelectStat value={selectedStat} onChange={handleStatChange} map={pokemonStat}/>
          </Grid>
        </Grid>
        {isLoading ? (
          <Loading />
        ) : (
          filteredPokemonList.length === 0 ? (
              <NoItem text={`Pokémon`} />
          ) : (
            <Grid container spacing={2}>
              {filteredPokemonList.map((pokemon, index) => {
                const { cardBackground, imageBackground } = getColor(pokemon.color);
                
                return (
                  <Grid item key={index} xs={12} sm={6} md={4} lg={3} xl={3}>
                    <Scale key={pokemon.id}>
                      <Card key={pokemon.id} sx={{ backgroundColor: cardBackground }}>
                        <PokeModal
                          pokeImage={<Pokemon.Sprites sprites={pokemon.sprites.front_default} name={pokemon.name} />}
                          pokemonName={<Pokemon.Name name={pokemon.name} />}
                          pokemonNumber={<Pokemon.ID id={pokemon.id} />}
                          pokemonType={<Pokemon.Type map={pokemon.types} />}
                          pokeball={<Pokemon.Pokeball legendary={pokemon.is_legendary} mythical={pokemon.is_mythical} total={pokemon.total} />}
                          pokemonHp={pokemon.hp}
                          pokemonAtk={pokemon.atk}
                          pokemonDef={pokemon.def}
                          pokemonSatk={pokemon.specialAttack}
                          pokemonSdef={pokemon.specialDefense}
                          pokemonSpeed={pokemon.speed}
                          pokemonTotal={pokemon.total}
                          pokemonHeight={`${pokemon.height / 10} m`}
                          pokemonWeight={`${pokemon.weight / 10} kg`}
                          pokemonAbilities={
                            pokemon.abilities.map((abilities, index) => (
                              <Fragment key={index}>
                                {index > 0 && ' / '}
                                <Pokemon.StatName name={abilities} />
                              </Fragment>
                          ))}
                          pokemonEggGroup={
                            pokemon.eggGroups.map((eggGroups, index) => (
                              <React.Fragment key={index}>
                                {index > 0 && ' / '}
                                <Pokemon.StatName name={eggGroups.name} />
                              </React.Fragment>
                          ))}
                          pokemonGrowthRate={<Pokemon.StatName name={pokemon.growthRate} />}
                          pokemonColor={<Pokemon.ColorSquare color={imageBackground} name={pokemon.color} />}
                          pokemonHabitat={<Pokemon.StatName name={pokemon.habitat} />}
                          pokemonShape={<Pokemon.StatName name={pokemon.shape} />}
                          pokemonGen={pokemon.generation}
                          pokemonLegendary={pokemon.is_legendary}
                          pokemonMythical={pokemon.is_mythical}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: imageBackground, m: 0.7, borderRadius: '5px' }}>
                            <Pokemon.Sprites sprites={pokemon.sprites.front_default} name={pokemon.name}/>
                          </Box>
                          <CardContent>
                            <Stack direction='row' alignItems='center'>
                              <Box>
                                <Pokemon.Pokeball legendary={pokemon.is_legendary} mythical={pokemon.is_mythical} total={pokemon.total} />
                              </Box>
                              <Box>
                                <Typography variant='body2' color='text.secondary' sx={{ color: pokemon.color === 'black' ? grey[200] : pokemon.color === 'white' ? grey[700] : 'none' }}>
                                  <Pokemon.SelectedStat
                                    selectedStat={selectedStat}
                                    id={pokemon.id}
                                    hp={pokemon.hp}
                                    atk={pokemon.atk}
                                    def={pokemon.def}
                                    satk={pokemon.specialAttack}
                                    sdef={pokemon.specialDefense}
                                    spd={pokemon.speed}
                                    total={pokemon.total}
                                    ht={pokemon.height}
                                    wt={pokemon.weight}
                                  />
                                </Typography>
                              </Box>
                            </Stack>
                            <Typography
                              sx={{ lineHeight: 1.2, maxHeight: '2.4em', overflow: 'hidden', textOverflow: 'ellipsis', color: pokemon.color === 'black' ? grey[50] : pokemon.color === 'white' ? grey[900] : 'none' }}
                              variant='h6'
                              component='div'
                            >
                              <Pokemon.Name name={pokemon.name} />
                            </Typography>
                            <Stack sx={{ marginTop: '8px' }} direction='row' spacing={1}>
                              <Pokemon.Type map={pokemon.types} />
                            </Stack>
                          </CardContent>
                        </PokeModal>
                      </Card>
                    </Scale>
                  </Grid>
                );
              })}
            </Grid>
          )
        )}
      </Box>
    </Fragment>
  );
}

export default Pokedex;
