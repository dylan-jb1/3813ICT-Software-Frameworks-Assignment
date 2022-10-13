const {MongoClient} = require( 'mongodb' );
const url = "mongodb://localhost:27017";

var _db;

module.exports = {

  connectToServer: function( callback ) {
    MongoClient.connect( url,  { useNewUrlParser: true }, function( err, client ) {
      _db  = client.db('3813-App');
      return callback( err );
    } );
  },

  getDb: function() {
    return _db;
  },

  closeDb: function() {
    _db.close();
  }
};