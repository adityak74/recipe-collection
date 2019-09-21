import { adopt } from 'react-adopt';
import React from 'react';
import { Query, withApollo } from 'react-apollo';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import AddNew from '../components/ingredients/AddNew';
import Containers from '../components/ingredients/Containers';
import ErrorMessage from '../components/ErrorMessage';
import Loading from '../components/Loading';
import Header from '../components/Header';
import Filters from '../components/ingredients/Filters';
import { GET_ALL_INGREDIENTS_QUERY, GET_INGREDIENTS_COUNT_QUERY } from '../lib/apollo/queries';

// TODO look into SSR config to see if i can serve the page with the aggregate baked in
const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getIngredients: ({ render }) => (
		<Query query={ GET_ALL_INGREDIENTS_QUERY }>
			{render}
		</Query>
	),

	// eslint-disable-next-line react/prop-types
	getIngredientCounts: ({ render }) => (
		<Query query={ GET_INGREDIENTS_COUNT_QUERY }>
			{render}
		</Query>
	),
});

const IngredientsPageStyles = styled.article`
`;

class Ingredients extends React.PureComponent {
	render() {
		console.warn('[ingredients] render');
		const { query } = this.props;
		const { group = 'name', id = null, view = 'all' } = query;

		return (
			// eslint-disable-next-line
			<Composed variables={{ group, ingredientID: id, view }}>
				{
					({ getIngredients, getIngredientCounts }) => {
						const { error, loading } = getIngredients;
						const { data } = getIngredientCounts || {};
						const { ingredientAggregate } = data || {};
						const { ingredientsCount, newIngredientsCount } = ingredientAggregate || {};

						return (
							<IngredientsPageStyles>
								<Header pageHeader="Ingredients" />
								<section>
									<Filters
										group={ group }
										ingredientsCount={ ingredientsCount }
										newIngredientsCount={ newIngredientsCount }
										view={ view }
									/>

									{ (error) ? <ErrorMessage error={ error } /> : null }

									{
										(loading)
											? <Loading name="ingredients" />
											: (
												<Containers
													group={ group }
													ingredientID={ id }
													view={ view }
												/>
											)
									}

									<AddNew />
								</section>
							</IngredientsPageStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Ingredients.defaultProps = {
	query: {
		group: 'name',
		id: null,
		view: 'all',
	},
};

Ingredients.propTypes = {
	query: PropTypes.shape({
		group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
		id: PropTypes.string,
		view: PropTypes.oneOf([ 'all', 'new' ]),
	}),
};

export default withApollo(Ingredients);
