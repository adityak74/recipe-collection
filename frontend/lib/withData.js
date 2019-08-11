import ApolloClient, { InMemoryCache } from 'apollo-boost';
import gql from 'graphql-tag';
import withApollo from 'next-with-apollo';
import { GET_ALL_INGREDIENTS_QUERY, GET_VIEW_INGREDIENTS_QUERY } from './apollo/queries';
import { CREATE_CONTAINERS_MUTATION, UPDATE_CONTAINER_INGREDIENT_ID_MUTATION, UPDATE_IS_CONTAINER_EXPANDED_MUTATION } from './apollo/mutations';
import { endpoint } from '../config';
/* eslint-disable object-curly-newline */
import {
	generateByCount,
	generateByName,
	generateByProperty,
	generateByRelationship,
} from './generateContainers';
/* eslint-enable object-curly-newline */

const typeDefs = gql`
	type Container {
		count: Int!
		id: String!
		ingredientID: String
		ingredients: [ ContainerIngredient ]!
		isExpanded: Boolean!
		label: String!
	}

	type ContainerIngredient {
		hasParent: Boolean!
		id: ID!
		isValidated: Boolean!
		name: String!
		properties: Properties!
		referenceCount: Int!
	}

	type Properties {
		id: ID!
		meat: Boolean!
		poultry: Boolean!
		fish: Boolean!
		dairy: Boolean!
		soy: Boolean!
		gluten: Boolean!
	}

	type ContainersResponse {
    containers: [ Container ]
  }

	type Query {
		viewIngredients: [ ContainerIngredient ]!
		containers: [ Container ]!
	}

	type Mutation {
   	createContainers(
	  	group: String!
			ingredients: [ ContainerIngredient ]!
			view: String!
    ) : ContainersResponse
	}

	type Mutation {
   	setCurrentCard(
	  	id: String!
			ingredientID: String
    ) : null
	}

	type Mutation {
   	setContainerIsExpanded(
	  	id: String!
			isExpanded: Boolean!
    ) : null
	}
`;

function createClient({ headers }) {
	const cache = new InMemoryCache();

	return new ApolloClient({
		uri: process.env.NODE_ENV === 'development' ? endpoint : endpoint,
		request: operation => operation.setContext({
			fetchOptions: { credentials: 'include' },
			headers,
		}),
		cache,
		clientState: {
			resolvers: {
				Query: {
					async containers(_, { group, view }, { client }) {
						console.warn(`... [withData](${ group }, ${ view }) containers query resolver`);
						let containers = [];
						let ingredients = [];

						// fetch the ingredients for this view from the cache
						const ingredientsViewData = await client.query({
							// if this isn't in the cache, then go through the local query resolver
							fetchPolicy: 'cache-first',
							query: GET_VIEW_INGREDIENTS_QUERY,
							variables: { view },
						});

						ingredients = ingredientsViewData.data.viewIngredients;

						// group the ingredients into containers
						const { data } = await client.mutate({
							mutation: CREATE_CONTAINERS_MUTATION,
							variables: {
								group,
								ingredients,
								view,
							},
						});

						({ containers } = data.createContainers);

						return containers;
					},
					viewIngredients(_, { view }) {
						console.warn(`... [withData](${ view }) viewIngredients query resolver`);
						// get all ingredients from the cache
						let { ingredients } = cache.readQuery({ query: GET_ALL_INGREDIENTS_QUERY });

						// filter ingredients based on the view
						if (view === 'new') {
							ingredients = ingredients.filter(i => !i.isValidated);
						}
						if (view === 'search') {
							// TODO
						}

						// pare down the ingredient info to match the ContainerIngredient shape
						ingredients = ingredients.map(i => ({
							__typename: 'ContainerIngredient',
							hasParent: Boolean(i.parent),
							id: i.id,
							isValidated: i.isValidated,
							name: i.name,
							properties: { ...i.properties },
							referenceCount: 0,
						}));

						return ingredients;
					},
				},
				Mutation: {
					// eslint-disable-next-line object-curly-newline
					createContainers(_, { group, ingredients, view }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ group }, ingredients: ${ ingredients.length }, ${ view }) createContainers mutation resolver`);
						let containers = [];
						// eslint-disable-next-line max-len
						// TODO in regards to the ingredientID, sure, i can pass this as a variable to containers, but then i'm going to have SO MANY MORE containers in the cache and that feels silly and wrong. i think i need to figure out how to pass in the query params off the router maybe as an HOC? or maybe this just happens as a secondary mutation to set the ingredientID fragment thru a separate toggleContainerIngredientID mutation

						switch (group) {
						case 'count':
							containers = generateByCount(null, ingredients);
							break;
						case 'property':
							containers = generateByProperty(null, ingredients);
							break;
						case 'relationship':
							containers = generateByRelationship(null, ingredients);
							break;
						default:
							containers = generateByName(null, ingredients, view);
							break;
						}

						return {
							__typename: 'ContainersResponse',
							containers,
						};
					},
					// eslint-disable-next-line object-curly-newline
					setCurrentCard(_, { id, ingredientID }, { getCacheKey }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ id }, ${ ingredientID }) setCurrentCard mutation resolver`);

						cache.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: gql`
								fragment setCurrentCard on Container {
									ingredientID
								}
							`,
							data: {
								__typename: 'Container',
								ingredientID,
							},
						});

						return null;
					},
					// eslint-disable-next-line object-curly-newline
					setContainerIsExpanded(_, { id, isExpanded }, { getCacheKey }) {
						// eslint-disable-next-line max-len
						console.warn(`,,, [withData](${ id }, ${ isExpanded }) setContainerIsExpanded mutation resolver`);

						cache.writeFragment({
							id: getCacheKey({
								__typename: 'Container',
								id,
							}),
							fragment: gql`
								fragment setIsExpanded on Container {
									isExpanded
								}
							`,
							data: {
								__typename: 'Container',
								isExpanded,
							},
						});

						return null;
					},
				},
			},
			typeDefs,
		},
	});
}

export default withApollo(createClient);
