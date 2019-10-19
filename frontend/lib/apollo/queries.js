import gql from 'graphql-tag';

/* Containers */
export const GET_CONTAINER_QUERY = gql`
	query GET_CONTAINER_QUERY($id: String!) {
		container(id: $id) @client {
			id
			ingredientID
			ingredients {
				hasParent
				id
				isValidated
				name
				properties {
					meat
					poultry
					fish
					dairy
					soy
					gluten
				}
			}
			isExpanded
			label
			referenceCount
		}
	}
`;

export const GET_CONTAINERS_QUERY = gql`
	query GET_CONTAINERS_QUERY($group: String, $ingredientID: String, $view: String) {
		containers(group: $group, ingredientID: $ingredientID, view: $view) @client {
			id
			ingredientID
			ingredients {
				hasParent
				id
				isValidated
				name
				properties {
					meat
					poultry
					fish
					dairy
					soy
					gluten
				}
			}
			isExpanded
			label
			referenceCount
		}
	}
`;

export const GET_VIEW_INGREDIENTS_QUERY = gql`
	query GET_VIEW_INGREDIENTS_QUERY($view: String) {
		viewIngredients(view: $view) @client {
			hasParent @client
			id
			isValidated
			name
			properties {
				meat
				poultry
				fish
				dairy
				soy
				gluten
			}
			referenceCount @client
		}
	}
`;

export const GET_SUGGESTED_INGREDIENTS_QUERY = gql`
	query GET_SUGGESTED_INGREDIENTS_QUERY($value: String) {
		suggestions(value: $value) @client {
			id
			name
		}
	}
`;

/* Ingredients */
export const GET_INGREDIENTS_COUNT_QUERY = gql`
  query GET_INGREDIENTS_COUNT_QUERY {
  	ingredientAggregate {
	  	ingredientsCount
			newIngredientsCount
		}
  }
`;

export const GET_ALL_INGREDIENTS_QUERY = gql`
  query GET_ALL_INGREDIENTS_QUERY {
  	ingredients {
  		id
			name
			plural
			alternateNames {
				name
			}
			properties {
				meat
			  poultry
			  fish
			  dairy
			  soy
			  gluten
			}
			parent {
				id
			}
			isComposedIngredient
			isValidated
		}
  }
`;

export const GET_INGREDIENT_BY_VALUE_QUERY = gql`
  query GET_INGREDIENT_BY_VALUE_QUERY($value: String!) {
  	ingredient(value: $value) @client {
			id
			name
			properties {
				meat
			  poultry
			  fish
			  dairy
			  soy
			  gluten
			}
			isValidated
		}
  }
`;

export const GET_INGREDIENT_BY_ID_QUERY = gql`
  query GET_INGREDIENT_BY_ID_QUERY($id: ID!) {
		ingredient(where: { id: $id }) {
			id
			parent {
				id
				name
			}
			name
			plural
			properties {
				meat
				poultry
				fish
				dairy
				soy
				gluten
			}
			alternateNames {
				name
			}
			relatedIngredients {
				id
				name
			}
			substitutes {
				id
				name
			}
			references {
				id
				reference
			}
			isValidated
      isComposedIngredient
		}
	}
`;

/* Recipes */
export const GET_RECIPES_COUNT_QUERY = gql`
  query GET_RECIPES_COUNT_QUERY {
  	recipeAggregate {
	  	recipesCount
		}
  }
`;

export const GET_ALL_RECIPES_QUERY = gql`
  query GET_ALL_RECIPES_QUERY {
  	recipes {
  		id
			evernoteGUID
			image
			source
			title
			categories {
				id
				name
			}
			tags {
				id
				name
			}
		}
  }
`;

export default [
	GET_CONTAINER_QUERY,
	GET_CONTAINERS_QUERY,
	GET_VIEW_INGREDIENTS_QUERY,
	GET_INGREDIENTS_COUNT_QUERY,
	GET_INGREDIENT_BY_VALUE_QUERY,
	GET_INGREDIENT_BY_ID_QUERY,
	GET_ALL_INGREDIENTS_QUERY,
	GET_SUGGESTED_INGREDIENTS_QUERY,
	GET_RECIPES_COUNT_QUERY,
	GET_ALL_RECIPES_QUERY,
];
