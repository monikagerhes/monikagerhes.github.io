// declare global variables
var _canvas = null;
var _currentImg = null;
var _originalImg = null;

// added by Viktor
function drawToCanvas(canvas, simpleImg){
    if(!simpleImg.imageData){
        setTimeout(function() {
            drawToCanvas(canvas, simpleImg);
        }, 100);
        return;
    }
    _currentImg = simpleImg;
    __SimpleImageUtilities.flush(simpleImg.context, simpleImg.imageData);
    var fromX = (canvas.width - simpleImg.width)/2;
    var fromY = (canvas.height - simpleImg.height)/2;
    canvas.getContext('2d').drawImage(simpleImg.canvas, fromX, fromY, simpleImg.width, simpleImg.height);
}


function loadImage(){
    if(_canvas != null){
        clearCanvas();        
    }
    // get the js object representing the file input element
    var finput = document.getElementById("fileInput");
    // create two new SimpleImage objects based on the chosen file
    // one for storing the original image, and one for editing
    _originalImg = new SimpleImage(finput);
    _currentImg = new SimpleImage(finput);
    // get the js representation of the canvas
    _canvas = document.getElementById("can");
    // draw the image to the canvas
    drawToCanvas(_canvas, _currentImg);
}

function applyRedFilter(){
    checkImageLoaded(_currentImg);
    var redPic = redPicMaker(_canvas);
    drawToCanvas(_canvas, redPic);
}

// return an image with enhanced red color
function redPicMaker(img){
    var output = new SimpleImage(_currentImg);
        for(var pixel of output.values()){
            var red = pixel.getRed();
            var green = pixel.getGreen();
            var blue = pixel.getBlue();
            pixel.setRed(red * 1.1);
            pixel.setGreen(green * 0.9);
            pixel.setBlue(blue * 0.9);
        }
    return output;
}

function applyBlueFilter(){
    checkImageLoaded(_currentImg);
    var bluePic = bluePicMaker(_canvas);
    drawToCanvas(_canvas, bluePic);
}

// return a blue hue image 
function bluePicMaker(img){
    var output = new SimpleImage(_currentImg);
    for(var pixel of output.values()){
        avg = avgRGBcalc(pixel);
        if(avg < 128){
            pixel.setRed(0);
            pixel.setGreen(0);
            pixel.setBlue(avg * 2);
        }
        else{
            pixel.setRed(avg * 2 - 255);
            pixel.setGreen(avg * 2 - 255);
            pixel.setBlue(255);
        }
    }
    return output;
}

function applyGreyscaleFilter(){
    checkImageLoaded(_currentImg);
    var grayscaledPic = grayscaleMaker(_canvas);
    drawToCanvas(_canvas, grayscaledPic);
}

// return a grayscale image by setting the pixels' red, green and blue values to their averages
function grayscaleMaker(img){       
    var output = new SimpleImage(_currentImg);
        for(var pixel of output.values()){
            var avg = (pixel.getRed() + pixel.getGreen() + pixel.getBlue())/3;
            pixel.setRed(avg);
            pixel.setGreen(avg);
            pixel.setBlue(avg);
        }
    return output;
}

function applyRainbowFilter(){
    checkImageLoaded(_currentImg);
    var rainbowedPic = rainbowMaker(_canvas);
    drawToCanvas(_canvas, rainbowedPic);
}

// return a 7 striped rainbow colored image
function rainbowMaker(img){   
    var output = new SimpleImage(_currentImg);
    var imgHeight = output.getHeight();
    for(var pixel of output.values()){
        var avg = avgRGBcalc(pixel);
        // Red row
        if (pixel.getY() <= (imgHeight/7) * 1){
            if (avg < 128){
                pixel.setRed(avg * 2);
                pixel.setGreen(0);
                pixel.setBlue(0);
            }
            else {
                pixel.setRed(255);
                pixel.setGreen(2 * avg - 255);
                pixel.setBlue(2 * avg -255);
            }
        }
        // Orange row
        if(pixel.getY() <= (imgHeight/7) * 2 && pixel.getY() > (imgHeight/7) * 1){
            if (avg < 128){
                pixel.setRed(avg * 2);
                pixel.setGreen(0.8 * avg);
                pixel.setBlue(0);
            }
            else {
                pixel.setRed(255);
                pixel.setGreen(1.2 * avg -51);
                pixel.setBlue(2 * avg - 255);
            }
        }
        // Yellow row
        if(pixel.getY() <= (imgHeight/7) * 3 && pixel.getY() > (imgHeight/7) * 2){
            if (avg < 128){
                pixel.setRed(avg * 2);
                pixel.setGreen(avg * 2);
                pixel.setBlue(0);
            }
            else {
                pixel.setRed(255);
                pixel.setGreen(255);
                pixel.setBlue(2 * avg - 255);
            }
        }
        // Green row
        if(pixel.getY() <= (imgHeight/7) * 4 && pixel.getY() > (imgHeight/7) * 3){
            if (avg < 128){
                pixel.setRed(0);
                pixel.setGreen(avg * 2);
                pixel.setBlue(0);
            }
            else {
                pixel.setRed(2 * avg - 255);
                pixel.setGreen(255);
                pixel.setBlue(2 * avg - 255);
            }
        }
        // Blue row
        if(pixel.getY() <= (imgHeight/7) * 5 && pixel.getY() > (imgHeight/7) * 4){
            if (avg < 128){
                pixel.setRed(0);
                pixel.setGreen(0);
                pixel.setBlue(avg * 2);
            }
            else {
                pixel.setRed(2 * avg - 255);
                pixel.setGreen(2 * avg - 255);
                pixel.setBlue(255);
            }
        }
        // Indigo row
        if(pixel.getY() <= (imgHeight/7) * 6 && pixel.getY() > (imgHeight/7) * 5){
            if (avg < 128){
                pixel.setRed(0.8 * avg);
                pixel.setGreen(0);
                pixel.setBlue(avg * 2);
            }
            else {
                pixel.setRed(1.2 * avg - 51);
                pixel.setGreen(2 * avg - 255);
                pixel.setBlue(255);
            }
        }
        // Violet row
        if(pixel.getY() <= (imgHeight/7) * 7 && pixel.getY() > (imgHeight/7) * 6){
            if (avg < 128){
                pixel.setRed(1.6 * avg);
                pixel.setGreen(0);
                pixel.setBlue(1.6 * avg);
            }
            else {
                pixel.setRed(1.4 * avg + 153);
                pixel.setGreen(2 * avg - 255);
                pixel.setBlue(0.4 * avg + 153);
            }
        }
    }
    return output;
}

// return the average of the color values of the given pixel (i.e. brightness 0-255)
function avgRGBcalc(px){
    var avg = (px.getRed() + px.getGreen() + px.getBlue()) / 3;
    return avg;
}

function applyBlurredFilter(){
    checkImageLoaded(_currentImg);
    var blurredPic = blurredPicMaker(_canvas);
    drawToCanvas(_canvas, blurredPic);
}

// return a blurred image by changing each pixel randomly with a surrounding one
function blurredPicMaker(img){        
    var output = new SimpleImage(_currentImg);
    for(var pixel of output.values()){
        blurPixel(pixel, output, 10, 0.7);
    }
    return output;
}

function blurPixel(pixel, output, blurRange, originalColorRatio){
    // get the cordinates of the pixel
    var x = pixel.getX();
    var y = pixel.getY();
    // if the pixel is not on the edge of the image
    if(    x >= blurRange && x <= output.width - blurRange
        && y >= blurRange && y <= output.height - blurRange){
            // choose a random pixel from the range around the pixel
            var randomX = Math.round(pixel.getX() - blurRange + gaussianRandom() * 2 * blurRange);
            var randomY = Math.round(pixel.getY() - blurRange + gaussianRandom() * 2 * blurRange);
            var randomPix = output.getPixel(randomX, randomY);
            // set the ratio of the old and new pixel's values
            var newPix = mixColors(pixel, randomPix, originalColorRatio);
            pixel.setRed(newPix.red);
            pixel.setGreen(newPix.green);
            pixel.setBlue(newPix.blue);
    }
}
 
// returns a random number between 0 and 1 with near-normal distribution
function gaussianRandom() {
        var rand = 0;
        for (var i = 0; i < 6; i = i + 1) {
            rand = rand + Math.random();
        }
        return rand / 6;
}

// mix the colors of two pixels
function mixColors(firstPix, secondPix, firstPixelRatio){
    var firstPixRed = firstPix.getRed();
    var firstPixGreen = firstPix.getGreen();
    var firstPixBlue = firstPix.getBlue();
    var secondPixRed = secondPix.getRed();
    var secondPixGreen = secondPix.getGreen();
    var secondPixBlue = secondPix.getBlue();
    var mixedRed = firstPixRed * firstPixelRatio + secondPixRed * (1-firstPixelRatio);
    var mixedGreen = firstPixGreen * firstPixelRatio + secondPixGreen * (1-firstPixelRatio);
    var mixedBlue = firstPixBlue * firstPixelRatio + secondPixBlue * (1-firstPixelRatio);
    return {
        red: mixedRed,
        green: mixedGreen,
        blue: mixedBlue
    };
}

function applyTunnelVisionFilter(){
    checkImageLoaded(_currentImg);
    var tunneledPic = tunnelVisionPicMaker(_canvas);
    drawToCanvas(_canvas, tunneledPic);
}

// return an image blurred around a central circle
function tunnelVisionPicMaker(img){        
    var output = new SimpleImage(_currentImg);
    if(output.width < output.height){
            var r = (output.width/2) * 0.7;
    }
    else {
            r = (output.height/2) * 0.7;
    }
    var centerX = Math.round(output.width/2);
    var centerY = Math.round(output.height/2);
    for(var pixel of output.values()){
        var x = pixel.getX();
        var y = pixel.getY();
        var distance = Math.sqrt(Math.pow((centerX-x), 2) + Math.pow((centerY-y), 2));
        if (distance > r){
            blurPixel(pixel, output, 20, 0.2);
        }
    }
    return output;
}
    
// reset the original image
function reSet(){
    checkImageLoaded(_currentImg);
    drawToCanvas(_canvas, _originalImg);
}

function clearCanvas(){
    var ctx = _canvas.getContext('2d');
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);
}

function checkImageLoaded(img){
    if(img == null || ! img.complete()){
        alert("Image is not loaded!");
        return;
    }
}
