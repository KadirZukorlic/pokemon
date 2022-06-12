/* eslint-disable array-callback-return */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BounceLoader } from 'react-spinners';
import { css } from '@emotion/react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { pokemonTypes } from '../../data';
import { sortArray } from '../../Utils/Utils';
import { setPokemons } from '../../redux/Pokemons/pokemonActions';

// components
import Button from './../Button/Button';
import PokemonThumbnail from '../PokemonThumbnail/PokemonThumbnail';
import FormSelect from '../FormSelect/SelectInput';

import './styles.scss';

const mapState = ({ search, pokemonList }) => ({
  searchTerm: search.searchTerm,
  pokemons: pokemonList.pokemonList,
});

const PokemonList = () => {
  const [pokemonList, setPokemonList] = useState([]);
  const [baseUrl] = useState('https://pokeapi.co/api/v2/pokemon');
  const [loadMore, setLoadMore] = useState(baseUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [spinnerColor] = useState('#3b4cca');
  const [pokemonType, setPokemonType] = useState('all');

  const { searchTerm, pokemons } = useSelector(mapState);
  const dispatch = useDispatch();

  const getAllPokemons = async () => {
    const url = 'https://pokeapi.co/api/v2/pokemon?offset=300&limit=500'; // limit=1118 to fetch all of them

    setIsLoading(true);

    const res = await fetch(url);
    const data = await res.json();

    const configAllPokemons = (results) => {
      results.forEach(async (pokemon) => {
        const res = await fetch(`${baseUrl}/${pokemon.name}`);
        const data = await res.json();
        setPokemonList((prevPokemons) => [...prevPokemons, data]);
        await sortArray(pokemonList);
      });
    };
    configAllPokemons(data.results);
    setIsLoading(false);
  };

  // tried config

  const getPokemons = async () => {
    setIsLoading(true);
    setPokemons({ name: 'POKEMON', ID: '1' });

    const res = await fetch(loadMore);
    const data = await res.json();

    setLoadMore(data.next);

    const configPokemonObject = (results) => {
      results.forEach(async (pokemon) => {
        const res = await fetch(`${baseUrl}/${pokemon.name}`);
        const data = await res.json();
        setPokemonList((prevPokemons) => [...prevPokemons, data]);
        // await pokemonList.sort((a, b) => a.id - b.id);
        sortArray(pokemonList);
      });
    };
    configPokemonObject(data.results);
    console.log(setPokemons(data.results));

    console.log(data.results, '----------- DATA RESULTS');
    console.log(pokemonList, '---------------POKEMON LIST LOCAL STATE');
    console.log(pokemons, 'POKEMONS REDUX---------------');
    setIsLoading(false);
  };

  // console.log(setPokemons(pokemonList));

  useEffect(() => {
    getPokemons();
  }, []);

  useEffect(() => {
    dispatch(setPokemons(pokemonList));
  }, [pokemonList]);

  const handleSelect = (e) => {
    setPokemonType(e.target.value);
  };

  const configSelectInput = {
    value: pokemonType,
    label: 'Choose Pokemon Type',
    options: pokemonTypes,
    handleChange: handleSelect,
  };

  return (
    <>
      <BounceLoader
        color={spinnerColor}
        loading={isLoading}
        size={150}
        css={loaderCSS}
      />
      <FormSelect {...configSelectInput} style={{ marginLeft: '4.9rem' }} />
      <div className="wrapper">
        <div className="pokemon__wrapper">
          <div className="pokemonList__wrapper">
            {pokemons
              .filter((value) => {
                if (searchTerm === '') {
                  return value;
                } else if (
                  value.name.toLowerCase().includes(searchTerm.toLowerCase())
                ) {
                  return value;
                }
              })
              .filter((value) => {
                if (pokemonType === 'all') {
                  return value;
                } else if (pokemonType === value.types[0].type.name) {
                  return value;
                }
              })
              .map((pokemonStats, index) => (
                <Link to={`${pokemonStats.name}`} key={index}>
                  <PokemonThumbnail
                    id={pokemonStats.id}
                    image={pokemonStats.sprites.other.dream_world.front_default}
                    name={pokemonStats.name}
                    type={pokemonStats.types[0].type.name}
                  />
                </Link>
              ))}
          </div>
        </div>
        <div className="buttons">
          <Button onClick={() => getPokemons()}>Load more</Button>
          <Button onClick={() => getAllPokemons()}>Get All Pokemons</Button>
        </div>
      </div>
    </>
  );
};
export default PokemonList;

const loaderCSS = css`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;
