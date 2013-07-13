$( document ).ready( function() {
    var euclideanDistance = function( p1, p2 ) {
        var sum = 0;
        for( var i = 0; i < p1.length; i++ ) {
            sum += Math.pow( p1[i] - p2[i], 2 );
        }
        return Math.sqrt( sum );
    };

    var calCenter = function( points, n ) {
        var center = [];
        for( var i = 0; i < n; i++ ) { 
            center.push(0);
        }
        for( var i = 0; i < points.length; i++ ) {
            for( var j = 0; j < n; j++ ) {
                center[j] += points[i][j];
            }
        }
        for( var i = 0; i < n; i++ ) {
            center[i] = center[i] / ( points.length - 1 );
        }
        return center;
    };

    var kMean = function( points, numClusters, min_diff ) {
        var len = points.length,
            clusters = [],
            seen = [];
        
        while( clusters.length < numClusters ) {
            var idx = parseInt( Math.random() * len ),
                found = false;
            for( var i = 0; i < seen.length; i++ ) {
                if( idx === seen[i] ) {
                    found = true;
                    break;
                }
            }
            if( !found ) {
                seen.push( idx );
                clusters.push([ points[idx], [points[idx]] ]);
            }
        }

        while( true ) {
            plists = [];
            for( var i = 0; i < numClusters; i++ ) {
                plists.push([]);
            }

            for( var j = 0; j < len; j++ ) {
                var p = points[j],
                    smallest_distance = 10000000,
                    idx = 0;
                    
                for ( var i = 0; i < numClusters; i++ ) {
                    var distance = euclideanDistance( p, clusters[i][0] );
                    if( distance < smallest_distance ) {
                        smallest_distance = distance;
                        idx = i;
                    }
                }
                plists[idx].push( p );
            }

            var diff = 0;
            for( var i = 0; i < numClusters; i++ ) {
                var old = clusters[i],
                    list = plists[i],
                    center = calCenter( plists[i], 3 ),
                    new_cluster = [ center, ( plists[i] )],
                    dist = euclideanDistance( old[0], center );
                clusters[i] = new_cluster;
                diff = diff > dist ? diff : dist;
            }
            if( diff < min_diff ) break;
        }
        return clusters;
    };

    var rgbToHex = function(rgb) {
        var toHex = function( i ) {
            var h = parseInt( i ).toString( 16 );
            return h.length == 1 ? '0' + h : h;
        }
        return '#' + toHex( rgb[ 0 ]) + toHex( rgb[ 1 ]) + toHex( rgb[ 2 ]);
    };

    var extractColors = function(img, ctx, num) {
        var colors = [];
        ctx.drawImage( img, 0, 0, 200, 200 );
        var data = ctx.getImageData( 0, 0, 200, 200 ).data;
        for( var i = 0; i < data.length;  i += 4 ) {
            var r = data[ i ],
                g = data[ i + 1 ],
                b = data[ i + 2 ];
            colors.push([ r, g, b ]);
        }
        //console.log( colors.length );
        var results = kMean( colors, num, 1 ),
        hex = [];
        
        for( var i = 0; i < results.length; i++ ) {
            hex.push( rgbToHex( results[i][0] ));
        }
        return hex;
    };

    $( 'img' ).on( 'click', function() {
        var ctx = document.getElementById( 'canvas' ).getContext( '2d' );
        var result = $( '#result' );
        result.empty();
        var html = null;
        $( '<img/>' ).attr( 'src', $( this ).attr( 'src' ))
        .load(function() {
            var startDate = new Date().getTime();
            var colors = extractColors( this, ctx, 8);
            var endDate = new Date().getTime();
            //console.log(endDate-startDate);
            //console.log(colors);
            for( var i = 0; i < colors.length; i++ ) {
                html = "<li style='background-color: " + colors[i] + ";'></li>";
                result.append(html);
            }
        });
    });
});