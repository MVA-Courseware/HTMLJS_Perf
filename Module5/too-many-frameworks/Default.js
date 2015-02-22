// Revealing module to keep global scope clean
var flyingImages = (function() {
	// cached values
	var boardWidth, 
		boardHeight,
		boardLeft,
		boardTop;

	//  DOM references
	var board,
		fps,
		countimages,
		notes,
		useDefaultImages,
		useHighResolutionImage,
		useMixImage,
		useMyBrowserLogo,
		useBrowserLogos,
		changeCountUp,
		changeCountDown,
		zoomInButton,
		zoomNormalButton,
		resetScene;
		
	//  Current Image Set in Use
	var IMAGE;

	// Image Sources
	var IMAGE_PATH,
		DEFAULTIMAGE,
		MIXIMAGE,
		LARGEIMAGE,
		LOGO1,
		LOGO1,
		LOGO2,
		LOGO3,
		LOGO4,
		IEIMAGE;

	//  Constants and Flags set using Setup(preferences)
	var START_COUNT = 2,		// One-dimensional image count  [8] Change starting image count
		START_ANIMATION = true,	// Determines if animation has started or not
		MINCOUNT = 2,			// Minimum one-dimensional image count
		MAXCOUNT = 24,			// Maximum one-dimensional image count
		TRACK_MOUSE = true;		// Move the images based on the mouse movement
	
	// Physics controls
	var PROXIMITY = 90,
		PREVIOUSPROXIMITY = 90,
		NORMALPROXIMITY = 90,
		MINPROXIMITY = 25,
		MAXPROXIMITY = 160,
		TARGETPROXIMITY = 25,
		xDAMPING = 7000,
		yDAMPING = 10,
		FL = 200,
		RATIO = 3;		
		
	// State
	var images = [],		// array of images
		count,				// count of images in one dimension
		intervalID,
		currentSecond = 0,
		currentFPS = 0,
		mouseX = 0,
		mouseY = 0,
		zoomed = false,
		mouseOverControls = false,
		zoomingOut = false,
		timeLastAnimation,
		insidecontrolpanel,
		controlpanelzoomed = false,
		useBrowserLogos = true,
		lastPointerDown = new Date(),
		trackPointerDown = false,
		countPointerDown = 0,
		a = 0,
		y = 0;

	/* PUBLIC: Setup the board
	 *************************************************************************/
	function Setup() {
		count = START_COUNT;
		
		// Set up the models / events
		setDocumentReferences();
		setDocumentEvents();
		setImageSources();
	
		// Create the board
		getBounds();
		createBoard();
		
		// Set a default mouse y position to start drawing
		y = mouseY = boardHeight / 2;
		
		draw();           // [4]     - Draw a single frame
		startAnimation(); // [5][10] - Start Animation at load
	}
	
	
	/* PRIVATE: Get references to all the DOM objects we will use
	 *************************************************************************/	
	function setDocumentReferences() {
		log("setDocumentReferences");
		
		// Main Content Sections
		board = document.getElementById('board');
		fps = document.getElementById('fps');
		countimages = document.getElementById('countimages');
		
		// Control Panel Buttons
		useDefaultImages =  document.getElementById('UseDefaultImages');
		useHighResolutionImage =  document.getElementById('UseHighResolutionImage');
		useMixImage =  document.getElementById('UseMixImage');
		useMyBrowserLogo =  document.getElementById('UseMyBrowserLogo');
		useBrowserLogos =  document.getElementById('UseBrowserLogos');
		changeCountUp =  document.getElementById('ChangeCountUp');
		changeCountDown =  document.getElementById('ChangeCountDown');
		zoomInButton =  document.getElementById('ZoomInButton');
		zoomNormalButton =  document.getElementById('ZoomNormalButton');
		resetScene =  document.getElementById('ResetScene');
		notes =  document.getElementById('notes');
	}
	
	
	/* PRIVATE: Setup event handlers for the DOM
	 *************************************************************************/
	function setDocumentEvents() {
		log("setDocumentEvents");
		
		if(window.addEventListener) { /* If we support addEventListener */
			// Control Panel Actions
			useDefaultImages.addEventListener("click", UseDefaultImages, false);
			useHighResolutionImage.addEventListener("click", UseHighResolutionImage, false);
			useMixImage.addEventListener("click", UseMixImage, false);
			useMyBrowserLogo.addEventListener("click", UseMyBrowserLogo, false);
			useBrowserLogos.addEventListener("click", UseBrowserLogos, false);
			changeCountUp.addEventListener("click", function() { ChangeCount(2); }, false);
			changeCountDown.addEventListener("click", function() { ChangeCount(-2); }, false);
			zoomInButton.addEventListener("click", ZoomInButton, false);
			zoomNormalButton.addEventListener("click", ZoomNormalButton, false);
			resetScene.addEventListener("click", ResetScene, false);
			
			
			// Touch/Mouse/Keyboard Input Actions
			if (window.navigator.msPointerEnabled) {
				window.addEventListener("resize", getBounds, false);
				window.addEventListener("contextmenu", function (e) { if(e.preventDefault) { e.preventDefault(); } }, false);
				window.addEventListener("selectstart", function (e) { if(e.preventDefault) { e.preventDefault(); } }, false);
				window.addEventListener("dragstart", function (e) { if(e.preventDefault) { e.preventDefault(); } }, false);
				
				document.addEventListener("keypress", OnKeyPress, false);
				
				if(TRACK_MOUSE) {
					document.addEventListener("MSPointerMove", OnMouseMove, false);
					document.addEventListener("MSPointerDown", OnPointerDown, false);
					document.addEventListener("MSPointerUp", OnPointerUp, false);
				}
				notes.innerHTML = "<span>Hold shift key to spin faster.</span></span>";
			} else {
				window.addEventListener("resize", getBounds, false);
				document.addEventListener("keypress", OnKeyPress, false);
				if(TRACK_MOUSE) {
					window.addEventListener("mousemove", OnMouseMove, false);
				}
				notes.innerHTML = "<span>Hold shift key to spin faster.</span>";
			}
			
		} else {  /* Try fallback to attachEvent */
			// Control Panel Actions
			useDefaultImages.attachEvent("onclick", UseDefaultImages);
			useHighResolutionImage.attachEvent("onclick", UseHighResolutionImage);
			useMixImage.attachEvent("onclick", UseMixImage);
			useMyBrowserLogo.attachEvent("onclick", UseMyBrowserLogo);
			useBrowserLogos.attachEvent("onclick", UseBrowserLogos);
			changeCountUp.attachEvent("onclick", function() { ChangeCount(2); });
			changeCountDown.attachEvent("onclick", function() { ChangeCount(-2); });
			zoomInButton.attachEvent("onclick", ZoomInButton);
			zoomNormalButton.attachEvent("onclick", ZoomNormalButton);
			resetScene.attachEvent("onclick", ResetScene);
		
			// Touch / Mouse / Keyboard Input Actions
			window.attachEvent("onresize", getBounds);
			document.attachEvent("onkeypress", OnKeyPress);
			if(TRACK_MOUSE) {
				window.attachEvent("onmousemove", OnMouseMove);
			}
			notes.innerHTML = "<span>Hold shift key to spin faster.</span>";
		}
	}
	
	/* PRIVATE: Setup the paths for images
	 *************************************************************************/
	function setImageSources() {
		log("setImageSources");
		IMAGE_PATH = "images/";
		
		DEFAULTIMAGE = IMAGE_PATH + "IEMedium.png";
		MIXIMAGE = IMAGE_PATH + "MixPhoto.png";
		LARGEIMAGE = IMAGE_PATH + "LargeIELogo.png";
		LOGO1 = IMAGE_PATH + "Logo1.png";
		LOGO2 = IMAGE_PATH + "Logo2.png";
		LOGO3 = IMAGE_PATH + "Logo3.png";
		LOGO4 = IMAGE_PATH + "Logo4.png";
		IEIMAGE = IMAGE_PATH + "IELogo.png";	
		
		IMAGE = DEFAULTIMAGE;		
	}
	
	/* PRIVATE: Create the board 
	 *************************************************************************/
	function createBoard() {
		images = [];
		board.innerHTML = "";

		var c = 1;
		var i = count / 2 - .5;
		
		for (var x = -i; x <= i; x++) {
			for (var z = -i; z <= i; z++) {
				var img = document.createElement('img');
				img.setAttribute("name", "rotatingimage");
				img.style.left = '5000px';
				img.x3d = x;
				img.z3d = z;
				if (useBrowserLogos == true) {
					switch (c) {
						case 1:
							img.src = IEIMAGE;
							c++;
							break;
						case 2:
							img.src = LOGO2;
							c++;
							break;
						case 3:
							img.src = LOGO1;
							c++;
							break;
						case 4:
							img.src = LOGO4;
							c++;
							break;
						case 5:
							img.src = LOGO3;
							c = 1;
							break;
					}
				}
				else {
					img.src = IMAGE;
				}

				
				// img.classList.add("animateLogo"); 		// [10] - CSS Animation

				board.appendChild(img);
				images.push(img);
			}
		}
		
		countimages.value = images.length;
	}	

	/* PRIVATE: Draw the Images
	 *************************************************************************/	
	function draw() {
		
		requestAnimationFrame(draw);  // [7] - Use requestAnimationFrame
		
		a += (mouseX - boardWidth) / xDAMPING;
		y += ((mouseY - boardHeight) - y) / yDAMPING;

		var ca = Math.cos(a);
		var sa = Math.sin(a);

		var img = null;
		for (var i = 0; img = images[i]; i++) {
			var x = img.x3d * (boardWidth / (PROXIMITY / 5));
			var z = img.z3d * (boardWidth / (PROXIMITY / 5));
			var X = sa * x + ca * z;
			var Y = sa * z - ca * x;
			var W = FL / (FL + Y);
			var w = Math.round(W * boardWidth / (PROXIMITY / 5));

			img.style.left = Math.round(X * W + boardWidth - w * .5) + 'px';
			img.style.top = Math.round(y * W + boardHeight - w * .5) + 'px';
			var width = Math.max(2, w);
			var height = Math.max(6, w * RATIO);
			if (width < 5) {
				img.style.width = '0px';
				img.style.height = '0px';
			}
			else {
				img.style.width = width + 'px';
				img.style.height = height + 'px';
				
				// var thisw = img.offsetWidth; // [9] - Do Readback in loop
			}
			img.style.zIndex = w;
		}

		var rightNow = new Date().getSeconds();
		if (rightNow == currentSecond) {
			currentFPS++;
		}
		else {
			currentSecond = rightNow;
			// Account for clock skew which can be up to two frames (33.33ms) when hardware accelerated.
			fps.value = (currentFPS > 57) ? 60 : currentFPS;
			currentFPS = 1;
		}
	}	
	
	/* PRIVATE: Start the animtion cycle
	 *************************************************************************/	
	function startAnimation() {
		START_ANIMATION = true;

		requestAnimationFrame(draw);   		 		// [7] - Use requestAnimationFrame
		
		// intervalID = setInterval(draw, 4);      // [5][6] setInterval change to 4ms
	}
	
	/* PRIVATE: Stop the animtion cycle
	 *************************************************************************/	
	function stopAnimation() {
		START_ANIMATION = false;
		if(!!!USE_RAF) {	/* Use RAF if true or undefined */
			clearInterval(intervalID);
		}
	}	
	

	/* PRIVATE: Cache the current bounds of the screen
	 *************************************************************************/	
	function getBounds() {
		boardWidth = board.offsetWidth / 2;
		boardHeight = board.offsetHeight / 2;
		boardTop = board.offsetTop;
		boardLeft = board.offsetLeft;
		for (var p = board.offsetParent; p != null; p = p.offsetParent) {
			boardTop += p.offsetTop;
			boardLeft += p.offsetLeft;
		}
	}
	
	function log(event) {
		if(window.msWriteProfilerMark) {
			window.msWriteProfilerMark(event);
		} else if (console) {
			console.log(Date.now() + " " + event);
		}
	}
	
	
    /* PRIVATE: Event Handlers
	 ########################################################################*/
  	
	// Pointer Events
	function OnPointerDown(e) {
		if (countPointerDown < 2) countPointerDown++;
		var now = new Date();
		var delta = now - lastPointerDown;
		lastPointerDown = now;
	}

	function OnPointerUp(e) {
		countPointerDown--;
	}

	
	// Mouse Events

	function OnMouseMove(e) {
		if (countPointerDown > 1) {
			return false;
		}

		if (typeof e == 'undefined')
			e = window.event;

		if (e.ctrlKey) {
			return false;
		}

		if (e.shiftKey) {
			xDAMPING = 1000;
			yDAMPING = 10;
		}
		else {
			xDAMPING = 7000;
			yDAMPING = 10;
		}

		if ((mouseX > (boardWidth * 2) - 200) && (mouseY < 150)) {
			if (controlpanelzoomed == false) {
				controlpanelzoomed = true;
				ZoomOut();
			}
		}
		else {
			if (controlpanelzoomed == true) {
				controlpanelzoomed = false;
				ZoomRestore();
			}
		}

		mouseX = e.clientX;
		mouseY = e.clientY;
		return false;
	}



	// Key Events
	function OnKeyPress(e) {
		if (!e) e = window.event;

		var key = e.key;
		var code = e.keyCode || e.charCode;

		if (key == "+" || code == 43) {
			ChangeCount(2);
		}
		else if (key == "-" || code == 45) {
			ChangeCount(-2);
		}
		else if (key == "z" || code == 122) {
			ZoomIn();
		}
		else if (key == "x" || code == 120) {
			ZoomNormal();
		}
		else if (key == "r" || code == 114) {
			ResetScene();
		}
		else if(key == "t" || code == 116) {
			ToggleMouseMove();
		}
		else if(key == "d" || code == 100) {
			ToggleStartDraw();
		}
		else if(key == "a" || code == 97) {
			ToggleStartAnimation();
		}
	}


	// Zoom Functions
	function ZoomIn() {
		TARGETPROXIMITY = MINPROXIMITY;
		ZoomToTarget();
	}

	function ZoomOut() {
		PREVIOUSPROXIMITY = PROXIMITY;
		TARGETPROXIMITY = MAXPROXIMITY;
		ZoomToTarget();
	}

	function ZoomNormal() {
		TARGETPROXIMITY = NORMALPROXIMITY;
		if (PROXIMITY < NORMALPROXIMITY) {
			PROXIMITY = PROXIMITY + 1;
			setTimeout(ZoomNormal, 1);
		}
		else if (PROXIMITY > NORMALPROXIMITY) {
			PROXIMITY = PROXIMITY - 1;
			setTimeout(ZoomNormal, 1);
		}
	}

	function ZoomRestore() {
		TARGETPROXIMITY = PREVIOUSPROXIMITY;
		if (PROXIMITY + 5 < TARGETPROXIMITY) {
			PROXIMITY = PROXIMITY + 5;
			setTimeout(ZoomRestore, 1);
		}
		else if (PROXIMITY - 5 > TARGETPROXIMITY) {
			PROXIMITY = PROXIMITY - 5;
			setTimeout(ZoomRestore, 1);
		}
		else {
			PROXIMITY = TARGETPROXIMITY;
		}
	}

	function ZoomToTarget() {
		if (PROXIMITY < TARGETPROXIMITY) {
			PROXIMITY = PROXIMITY + 1;
			setTimeout(ZoomToTarget, 1);
		}
		else if (PROXIMITY > TARGETPROXIMITY) {
			PROXIMITY = PROXIMITY - 1;
			setTimeout(ZoomToTarget, 1);
		}
	}

	function ZoomInButton() {
		PREVIOUSPROXIMITY = MINPROXIMITY;
		ZoomIn();
	}

	function ZoomNormalButton() {
		PREVIOUSPROXIMITY = NORMALPROXIMITY;
		ZoomNormal();
	}


	// Button Click Event Handlers

	// Increase Items
	function ChangeCount(n) {
		var newcount = count + n;
		if (newcount >= MINCOUNT && newcount <= MAXCOUNT) {
			log("ChangeCount: " + count + "->" + newcount);		
			count = newcount;
			createBoard();
		}
	}

	// Change Images
	function ResetScene() {
		log("ResetScene");			
		count = START_COUNT;
		PROXIMITY = NORMALPROXIMITY;
		IMAGE = DEFAULTIMAGE;
		y = mouseY = boardHeight / 2;
		createBoard();
	}

	// Change Images
	function UseHighResolutionImage() {
		log("UseHighResolutionImage");			
		useBrowserLogos = false;
		IMAGE = LARGEIMAGE;
		createBoard();
	}

	function UseDefaultImages() {
		log("UseDefaultImages");	
		useBrowserLogos = false;
		IMAGE = DEFAULTIMAGE;
		createBoard();
	}

	function UseBrowserLogos() {
		log("UseBrowserLogos");	
		useBrowserLogos = true;
		IMAGE = DEFAULTIMAGE;
		createBoard();
	}

	function UseMixImage() {
		log("UseMixImage");	
		useBrowserLogos = false;
		IMAGE = MIXIMAGE;
		createBoard();
	}
	
	function ToggleMouseMove() {
		TRACK_MOUSE = !TRACK_MOUSE;
		if(TRACK_MOUSE) {
			if(document.addEventListener) {
				if (window.navigator.msPointerEnabled) {
					document.addEventListener("MSPointerMove", OnMouseMove, false);
					document.addEventListener("MSPointerDown", OnPointerDown, false);
					document.addEventListener("MSPointerUp", OnPointerUp, false);
				} else {
					window.addEventListener("mousemove", OnMouseMove, false);
				}
			} else {
				window.attachEvent("onmousemove", OnMouseMove);
			}
		} else {
			if(document.addEventListener) {
				if (window.navigator.msPointerEnabled) {
					document.removeEventListener("MSPointerMove", OnMouseMove);
					document.removeEventListener("MSPointerDown", OnPointerDown);
					document.removeEventListener("MSPointerUp", OnPointerUp);
				} else {
					window.removeEventListener("mousemove", OnMouseMove);
				}
			} else {
				window.detachEvent("onmousemove", OnMouseMove);
			}
		}
	}
	
	function ToggleStartAnimation() {
		if(!!START_ANIMATION) {
			stopAnimation();
		} else {
			startAnimation();
		}
	}
	
	function ToggleStartDraw() {
		START_DRAW = !START_DRAW;
	}	
	
	function UseMyBrowserLogo() {
		
		var agent = navigator.userAgent.toLowerCase();
		useBrowserLogos = false;
		if (agent.indexOf('chrome') > -1) {
			IMAGE = LOGO1;
		}
		else if (agent.indexOf('firefox') > -1) {
			IMAGE = LOGO2;
		}
		else if (navigator.appName == "Opera") {
			IMAGE = LOGO3;
		}
		else if (agent.indexOf('safari') > -1) {
			IMAGE = LOGO4;
		}
		else {
			IMAGE = DEFAULTIMAGE;
		}
		createBoard();
	}

	return {
		"setup" : Setup
	}
})();

// Load our flying images on startup
if(window.addEventListener) {
	window.addEventListener("load", function() { flyingImages.setup(); }, false);
} else if (window.attachEvent) {
	window.attachEvent("onload", function() { flyingImages.setup(); });
}
