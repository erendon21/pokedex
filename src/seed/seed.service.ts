import { Injectable } from '@nestjs/common';
// import axios, { AxiosInstance } from 'axios';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {
  // private readonly axios: AxiosInstance = axios;

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter,
  ) {}

  //Option 1
  async executeSeed() {
    // const { data } = await this.axios.get<PokeResponse>(
    //   'https://pokeapi.co/api/v2/pokemon?limit=20',
    // );

    /**
     * Using injectable and solving Liskov sustitution
     * */
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=20',
    );

    data.results.forEach(async ({ name, url }) => {
      const segment = url.split('/');
      const no: number = +segment[segment.length - 2];

      const pokemons = await this.pokemonModel.create({ name, no });
    });

    return data;
  }

  //Option 2: Better than Option 1
  async executeSeed2() {
    await this.pokemonModel.deleteMany();

    // const { data } = await this.http.get<PokeResponse>(
    //   'https://pokeapi.co/api/v2/pokemon?limit=3',
    // );

    /**
     * Using injectable and solving Liskov sustitution
     * */
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=20',
    );

    const insertPromiseArray: any[] = [];

    data.results.forEach(({ name, url }) => {
      const segment = url.split('/');
      const no = +segment[segment.length - 2];

      insertPromiseArray.push(this.pokemonModel.create({ name, no }));
    });

    const pokemons = await Promise.all(insertPromiseArray);
    console.log('Array results: ', pokemons);

    return 'Seed 2 Executed';
  }

  /**
   * Best Practice
   */

  async seedExecuted3() {
    // Delete records before insert
    await this.pokemonModel.deleteMany({});

    //Get Data from PokeAPI Using Axios
    // const { data } = await this.http.get<PokeResponse>(
    //   'https://pokeapi.co/api/v2/pokemon?limit=600',
    // );

    /**
     * Using injectable and solving Liskov sustitution
     * */
    const data = await this.http.get<PokeResponse>(
      'https://pokeapi.co/api/v2/pokemon?limit=600',
    );

    // Empty Array to store pokemons
    const pokemonsToInsert: { name: string; no: number }[] = [];

    console.log('Pokemons to Insert: ', pokemonsToInsert);

    data.results.forEach(({ name, url }) => {
      const segment = url.split('/');
      const no = +segment[segment.length - 2];

      pokemonsToInsert.push({ name, no });
    });

    const pokemons = await this.pokemonModel.insertMany(pokemonsToInsert);

    console.log('Inserted pokemons: ', pokemons);

    return pokemons;
  }
}
