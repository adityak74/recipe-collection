import { adopt } from 'react-adopt';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';

import Container from './Container';
import ErrorMessage from '../ErrorMessage';

const GET_ALL_CONTAINERS_QUERY = gql`
	query GET_ALL_CONTAINERS_QUERY($group: String!, $id: ID, $view: String!) {
		containers(group: $group, id: $id, view: $view) {
			currentIngredientID
			id
			isCardEnabled
			isContainerExpanded
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
				isValidated
			}
			label
		}
	}
`;

// TODO convert this back to a regular query if we end up back with one Query
const Composed = adopt({
	// eslint-disable-next-line react/prop-types
	getContainers: ({ group, id, render, view }) => (
		<Query
			query={ GET_ALL_CONTAINERS_QUERY }
			variables={ {
				group,
				id,
				view,
			} }
		>
			{ render }
		</Query>
	),
});

const ContainerStyles = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin: 20px 0;

	&.hidden {
		border-bottom: 0;
	}

	ul.hidden {
		display: none;
	}
`;

const MessageStyles = styled.div`
	font-style: italic;
	font-size: 14px;
`;

class Containers extends React.PureComponent {
	render() {
		console.warn('[Containers] render');
		const { group, id, view } = this.props;

		// NOTE: if you want to let the rest of the page load without waiting on this query
		// you can disable SSR here and call forceUpdate() in componentDidMount()
		// if you want to enable subsequant Loading states for reteches, add notifyOnNetworkStatusChange

		return (
			<Composed group={ group } id={ id } view={ view }>
				{
					({ getContainers }) => {
						const { data } = getContainers || {};
						const { loading, error } = data || {};
						const { containers } = data || [];

						if (loading) return <p>Loading ingredients...</p>;
						if (error) return <ErrorMessage error={ error } />;

						const hasContainers = ((containers.length === 1) && (containers[0].ingredients.length > 0));
						const message = (view === 'new') ? 'No new ingredients found.' : 'No ingredients found.';

						return (
							<ContainerStyles>
								{ (!hasContainers) ? <MessageStyles>{ message }</MessageStyles> : null }

								{
									hasContainers && containers.map(c => (
										<Container
											className={ ((!c.isContainerExpanded) || (c.ingredients.length === 0)) ? 'hidden' : '' }
											currentIngredientID={ c.currentIngredientID }
											id={ c.id }
											ingredients={ c.ingredients }
											isCardEnabled={ c.isCardEnabled }
											isContainerExpanded={ c.isContainerExpanded }
											key={ c.id }
											label={ c.label }
											view={ view }
										/>
									))
								}
							</ContainerStyles>
						);
					}
				}
			</Composed>
		);
	}
}

Containers.defaultProps = {
	group: 'name',
	id: null,
	view: 'all',
};

Containers.propTypes = {
	group: PropTypes.oneOf([ 'name', 'property', 'relationship', 'count' ]),
	id: PropTypes.string,
	view: PropTypes.oneOf([ 'all', 'new' ]),
};

export default Containers;
export { GET_ALL_CONTAINERS_QUERY };
