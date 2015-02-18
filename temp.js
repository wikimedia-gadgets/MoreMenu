'More' : {
  'Placeholder' : {
    url : '#'
  }
},

// Absorb the More (cactions) menu unless user disables it
if ( $.jStorage.get( 'mmNoAbsorbtion' ) ) {
  $( '#c2-page-more' ).remove();
} else {
  var $cactions = $( '#p-cactions' ).find( 'ul' ),
    $newCactions = $( '#c2-page-more' ).prop( 'id', 'p-cactions' );

  $( '#p-cactions' ).remove();
  $newCactions.find( 'ul' ).replaceWith($cactions);
  $newCactions.find( 'ul' ).append( '<li id="c2-unabsorb"><a><small>Disable this feature</small></a></li>' );

  $( '#c2-unabsorb' ).on( 'click', function() {
    if ( confirm( 'Hit OK to refresh the page with the More menu back at it\'s own tab.\n\nThis setting will persist only in this browser session. To re-enable, clear your browser\'s cache.' ) ) {
      $.jStorage.set( 'mmNoAbsorbtion', true );
      document.location.reload();
    }
  } );
}