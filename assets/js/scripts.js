window.onload = function() {

	var scanbtn = $('.scanbtn');
	var trackbtn = $('.trackbtn');

	var vid = document.getElementById('videoel');
	var overlay = document.getElementById('overlay');
	var overlayCC = overlay.getContext('2d');

	var reper = document.getElementById('reper');
	var reperCC = reper.getContext('2d');

	function openCamera () {
		navigator.getUserMedia = (navigator.getUserMedia ||
		                          navigator.webkitGetUserMedia ||
		                          navigator.mozGetUserMedia || 
		                          navigator.msGetUserMedia);

		if (navigator.getUserMedia) {
  			navigator.getUserMedia({ video: true },

    		function(localMediaStream) {
				vid.src = window.URL.createObjectURL(localMediaStream);
				vid.play();
    		},
		    function(err) {
		      console.log(err);
			});
		} else {
		  alert('not supported');
		}
	}
	

	var ctrack = new clm.tracker({useWebGL : true});
	ctrack.init(pModel);

	var deeFaceModel = {
		pupild:65.88,
		verticald:108.24,
		sinusd:39.30,
		mouthwided:52.13,
		facewided:119.11,
		nosewided:42.96,
		maxbrowsd:93.96,
		minbrowsd:25.82
	}

	var scannedFaceModel = {}

	var mappingPoints = {
		pupilpp:[27,32],
		verticalpp:[33,7],
		sinuspp:[33,62],
		mouthwidepp:[44,50],
		facewidepp:[0,14],
		nosewidepp:[35,39],
		maxbrowspp:[19,15],
		minbrowspp:[22,18]
	}

	var deeArray = $.map(deeFaceModel, function(value, index) {
		    return [value];
	});

	var mappingPointsArray = $.map(mappingPoints, function(value, index) {
		    return [value];
	});

	function distance (pointB, pointA) {
		var d = 0;
		var dx = pointB[0] - pointA[0];
		var dy = pointB[1] - pointA[1];

		d = Math.sqrt(Math.pow(dx,2) + Math.pow(dy,2));

		return d.toFixed(2);
	}

	function relativeVariation (xone, xtwo) {
		var rv = 0;
		var delta = Math.abs(xone - xtwo);

		rv = delta *100/xone; 

		return rv.toFixed(2);
	}

	function standardDeviation (valArray) {
		var sd = 0;
		var olenght = valArray.length;
		var avgSum = 0;
		var meanElem = mean(valArray);

		for(var j=0; j<olenght; j++) {
			var e = Math.pow((valArray[j] - meanElem),2);
			avgSum += e;
		}

		sd = avgSum / (olenght-1);

		return sd;
	}

	function mean (array) {
		var sum = 0;
		var avg = 0;
		var alength = array.length;

		for (var i=0; i<alength; i++) {
			var elem = parseFloat(array[i]);
			sum += elem; 
		}

		avg = (sum / alength).toFixed(2);

		return avg;
	}

	var objsize = Object.keys(deeFaceModel).length;

	function positionLoop() {
      requestAnimationFrame(positionLoop);
      var positions = ctrack.getCurrentPosition();
      
      var positionString = "";
      if (positions) {
        for (var p = 0;p < 70;p++) {
          positionString += "featurepoint "+p+" : ["+positions[p][0].toFixed(2)+","+positions[p][1].toFixed(2)+"]<br/>";
		}
         
      	// // calculate scanned distances
      	
        for(var q=0;q<objsize;q++) {
        	scannedFaceModel[q] = distance(positions[mappingPointsArray[q][0]], positions[mappingPointsArray[q][1]]);
        }
       
		var scannedArray = $.map(scannedFaceModel, function(value, index) {
		    return [value];
		});

		// calculate relative variations
		var rvArray = [];
		var rvNamesArray = [];
		var rvtext = "";

		for (name in deeFaceModel) {
			rvNamesArray.push(name); 
		}

		var sddee = standardDeviation(deeArray).toFixed(2);
        var sdscan = standardDeviation(scannedArray).toFixed(2);

		for(var k=0; k<objsize;k++){
			var rv = relativeVariation(deeArray[k], scannedArray[k]);
			rvArray.push(rv); 

			var textElem = "rv" + rvNamesArray[k] + ": " + rv + "% </br>";
			rvtext +=  textElem;
		}

        var meanRv = mean(rvArray);

        // document.getElementById('positions').innerHTML = positionString;
        $('#analisys').html(rvtext + "</br>" + "sdDee: " + sddee + "</br>" + "sdScan: " + sdscan); 
		$('#matchdisplay').html(100 - meanRv + "% DIANA");			
        								
      }
    }
        
    positionLoop();

    function drawStar(cx,cy,spikes,outerRadius,innerRadius){
      var rot=Math.PI/2*3;
      var x=cx;
      var y=cy;
      var step=Math.PI/spikes;

      reperCC.strokeSyle="#000";
      reperCC.beginPath();
      reperCC.moveTo(cx,cy-outerRadius)
      for(i=0;i<spikes;i++){
        x=cx+Math.cos(rot)*outerRadius;
        y=cy+Math.sin(rot)*outerRadius;
        reperCC.lineTo(x,y)
        rot+=step

        x=cx+Math.cos(rot)*innerRadius;
        y=cy+Math.sin(rot)*innerRadius;
        reperCC.lineTo(x,y)
        rot+=step
      }
      reperCC.lineTo(cx,cy-outerRadius)
      reperCC.stroke();
      reperCC.closePath();
    }

	function drawEyes () {
		 reperCC.fillRect(185.64, 128.59, 5,5);
		 reperCC.fillRect(249.28, 127.50, 5,5);		
	}

	function startTracking () { 	
		vid.play();
		ctrack.start(vid);

		drawLoop();
	}

	function drawLoop() {
		requestAnimFrame(drawLoop);
		overlayCC.clearRect(0, 0, 400, 300);

		if (ctrack.getCurrentPosition()) {
			ctrack.draw(overlay);
		}
	}

	

	window.requestAnimFrame = (function(){
	  return  window.requestAnimationFrame       ||
	          window.webkitRequestAnimationFrame ||
	          window.mozRequestAnimationFrame    ||
	          function(callback){
	            window.setTimeout(callback, 1000 / 60);
	          };
	})();

	scanbtn.click(function(){
	 	openCamera();
	 	//drawEyes();
	 	drawStar(185.64,128.59,5,8,4);
	 	drawStar(249.28,127.50,5,8,4);
	 });

	trackbtn.click(function(){
		startTracking();
	});

}