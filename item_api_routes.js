/**
 * using MySQL format to purge data retrieved from the frontend before sending to DB
 * all data returned is sent through variable dataToReturn
 * success will be true if there was no error in the retrieval of data
 * if success is false, there has been a failure in retrieving data from DB
 * inactive data from the DB will not be sent (inactive is psudo-deleted)
 */
const itemRoutes = ( server, mySQL, connection ) => {

    /**
	 * requires name, listID, and assignedUserID of the new item
	 */
	server.put( '/api/newitem', ( request, response ) => {
		const { name, listID } = request.body;

		const itemQuery = 'INSERT INTO items ( name, listID ) VALUES ( ?, ? )';
		const itemInserts = [ name, listID ];
		const itemSQL = mySQL.format( itemQuery, itemInserts );

		connection.query( itemSQL, ( error, results, fields ) => {
			if( error ){		//some of the data in the request was either missing, or in an incorrect form
				console.log( "/api/newitem Error:", error );
				const dataToReturn = {
					success: false,
					data: "Error: did not receive the expected information for a new item"
				}
				response.json( dataToReturn );
				return;
			}
			const successString = `The item "${name}" has been added to "List ${listID}"`;
			console.log( successString );

			const dataToReturn = {
				success: true,
				data: successString,
				itemID: results.insertId
			};
			response.json( dataToReturn );
		});
	});
	/**
	 * requires all pieces of the item to be updated (ID, name, listID, and assignedUserID)
	 * if they are to be updated, then the information will be different than the current DB version
	 * if they are to remain the same, the data still needs to be sent along with the updated information
	 */
	server.patch( '/api/updateitem', ( request, response ) => {
		const { ID, name, listID, assignedUserID } = request.body;
		if(!ID || !name || !listID || assignedUserID === undefined ){
			const dataToReturn = {
				success: false,
				data: 'missing item update information'
			};
			response.json( dataToReturn );
			return;
		}
		const itemUserVerificationQuery = 'SELECT * FROM ?? WHERE ?? = ?';
		const itemUserVerificationInserts = ['items', 'ID', ID];
		const itemUserVerificationSQL = mySQL.format( itemUserVerificationQuery, itemUserVerificationInserts );

		connection.query( itemUserVerificationSQL, ( error, results, fields ) => {
			if( error ){		//the itemID that was trying to be deleted was incorrect
				console.log( '/api/updateitem error:', error );
				const dataToReturn = {
					success: false,
					data: "Error: could not find item with the requested ID"
				}
				response.json( dataToReturn );
				return;
			}

			// if( request.user.ID !== results[0].assignedUserID ){
			// 	console.log( '/api/updateitem issue: unauthorized user attemped to update item ID', ID);
			// 	const dataToReturn = {
			// 		success: false,
			// 		data: 'Error: user is unauthorized to update the selected item'
			// 	};
			// 	response.json( dataToReturn );
			// 	return;
			// }
			let changedFields = '';
			if(results[0].name !== name){
				changedFields += 'name was changed ';
			}
			if(results[0].assignedUserID != assignedUserID){
				changedFields += 'assigned user was changed ';
			}
			const itemUpdateQuery = 'UPDATE items SET ??=?, ??=?, ??=? WHERE ?? = ?';
			const itemUpdateInserts = [ 'name', name, 'listID', listID, 'assignedUserID', assignedUserID, 'ID', ID ];
			const itemUpdateSQL = mySQL.format( itemUpdateQuery, itemUpdateInserts );
			console.log(itemUpdateSQL);

			connection.query( itemUpdateSQL, ( error, results, fields ) => {
				if( error ){		//missing data for the item to be updated
					console.log( "/api/updateitem Error:", error );
					const dataToReturn = {
						success: false,
						data: "Error: did not receive the expected items fields"
					}
					response.json( dataToReturn );
					return;
				};
				const successString = `The item ${ID} has been updated`;
				console.log( successString );

				const dataToReturn = {
					success: true,
					data: successString,
					changedFields
				};
				response.json( dataToReturn );
			});
		});
	});
	/**
	 * requires ID of the item to be deleted
	 * the item is not truely deleted, but the status is set to inactive
	 */
	server.post( '/api/deleteitem', ( request, response ) => {
		const { ID } = request.body;

		const itemUserVerificationQuery = 'SELECT * FROM ?? WHERE ?? = ?';
		const itemUserVerificationInserts = ['items', 'ID', ID];
		const itemUserVerificationSQL = mySQL.format( itemUserVerificationQuery, itemUserVerificationInserts );

		connection.query( itemUserVerificationSQL, ( error, results, fields ) => {
			if( error ){		//the itemID that was trying to be deleted was incorrect
				console.log( '/api/deleteitem error:', error );
				const dataToReturn = {
					success: false,
					data: "Error: could not find item with the requested ID"
				}
				response.json( dataToReturn );
				return;
			}
			
			if( request.user && request.user.ID !== results[0].assignedUserID ){
				console.log( '/api/deleteitem issue: unauthorized user attemped to delete item ID', ID);
				const dataToReturn = {
					success: false,
					data: 'Error: user is unauthorized to delete the selected item'
				};
				response.json( dataToReturn );
				return;
			}

			const itemDeleteQuery = 'UPDATE items SET ?? = ? WHERE ?? = ?';
			const itemDeleteInserts = [ 'status', 'inactive', 'ID', ID ];
			const itemDeleteSQL = mySQL.format( itemDeleteQuery, itemDeleteInserts );

			connection.query( itemDeleteSQL, ( error, results, fields ) => {
				
				const successString = `The item ${ID} has been set to inactive`;
				console.log( successString );

				const dataToReturn = {
					success: true,
					data: successString
				};
				response.json( dataToReturn );
			});
		});
	});
}

module.exports = itemRoutes;