// declare global variables
var fgImage = null;
var bgImage = null;
var sliderValue = 0;

// added by Viktor
function drawToCanvas(canvas, simpleImg){
    if(!simpleImg.imageData){
        setTimeout(function() {
            drawToCanvas(canvas, simpleImg);
        }, 100);
        return;
    }
    __SimpleImageUtilities.flush(simpleImg.context, simpleImg.imageData);
    var fromX = (canvas.width - simpleImg.width)/2;
    var fromY = (canvas.height - simpleImg.height)/2;
    canvas.getContext('2d').drawImage(simpleImg.canvas, fromX, fromY, simpleImg.width, simpleImg.height);
}

function setSliderDefaultValue(){
    changeGreenEvaluationFn();
}

function loadForegroundImage(){
    // get the js object representing the file input element
    var fimg = document.getElementById("foregroundFileInput");
    // create a new SimpleImage object based on the chosen file
    fgImage = new SimpleImage(fimg);
    // get the js representation of the first canvas
    var canvas1 = document.getElementById("can1");
    // draw the image to the canvas1
    drawToCanvas(canvas1, fgImage);
}

function loadBackgroundImage(){
    // get the js object representing the file input element
    var bimg = document.getElementById("backgroundFileInput");
    // create a new SimpleImage object based on the chosen file
    bgImage = new SimpleImage(bimg);
    // get the js representation of the second canvas
    var canvas2 = document.getElementById("can2");
    // draw the image to the canvas2
    drawToCanvas(canvas2, bgImage);
}

function changeGreenEvaluationFn(){
    // get the js object representing the slider input
    var range = document.getElementById("greenRange");
    if(document.getElementById("greendistancefunc").checked){
        range.min = 150;
        range.max = 255;
        range.value = Math.round((Number(range.min) + Number(range.max))/2);
    }
    else if(document.getElementById("greenadvantagefunc").checked){
        range.min = 1;
        range.max = 255;
        range.value = Math.round((Number(range.min) + Number(range.max))/2);
    }
    // display the current value of the slider 
    setGreenSensitivity();
}

function setGreenSensitivity(){
    // update the sliderValue (global variable)
    sliderValue = document.getElementById("greenRange").value;
    // display the value in the HTML area that has id "valuedemo"
    document.getElementById("valuedemo").innerHTML = "Value: " + sliderValue;             
}

function cropImagesToTheSame(){
    // get the js representation of the canvas HTML elements
    var canvas1 = document.getElementById("can1");
    var canvas2 = document.getElementById("can2");
    
    var commonSize = greatestCommonSize(fgImage, bgImage);
    alert("Common width: " + commonSize.width + " height: " + commonSize.height);
    // update the fgImage and bgImage global variables with their new dimensions
    fgImage = cropToSize(fgImage, commonSize.width, commonSize.height);
    bgImage = cropToSize(bgImage, commonSize.width, commonSize.height);
    // before displaying the new images, the canvases should be cleared
    clearCanvas();
    drawToCanvas(canvas1, fgImage);
    drawToCanvas(canvas2, bgImage); 
}

function greatestCommonSize(img1, img2){
    var w1 = img1.width;
    var h1 = img1.height;
    var w2 = img2.width;
    var h2 = img2.height;
    var gratestCommonWidth;
    var gratestCommonHeight;
    
    // the smaller width will be the greatest common width
    if(w1 > w2){
        gratestCommonWidth = w2;
    }
    else{
        gratestCommonWidth = w1;
    }
    
    // the smaller height will be the greatest common height
    if(h1 > h2){ 
        gratestCommonHeight = h2;
    }
    else{
        gratestCommonHeight = h1;
    }
    
    // returns an object with 2 properties
    return {width: gratestCommonWidth,
            height: gratestCommonHeight};
}

function cropToSize(img, width, height){
    // create a new blank Simple Image object with the given dimensions
    var output = new SimpleImage(width, height);
    //for each pixel of the output
    for(var pixel of output.values()){
        // get the pixel's x and y coordinates
        var x = pixel.getX();
        var y = pixel.getY();
        // because I want to use the center part of the image, calculate the starting points of the cuts, and round it to an integer
        var startX = x + ((img.width - width)/2);
        var startY = y + ((img.height - height)/2);
        startX = Math.round(startX);
        startY = Math.round(startY);
        // get the values of the adequate pixels of the source image
        var sourcePix = img.getPixel(startX, startY);
        // and copy them to the blank output image
        pixel.setAllFrom(sourcePix);
    }
    return output;
}

function sameSizeImages(img1, img2) {
    if(img1.width == img2.width || img1.height == img2.height){
        return true;
    }
    else{
        return false;
    }
}

// This function returns the distance of the argument SimplePixel from the absolute green color in a 3d color space.
function calcGreenDistance(px){
    var red = px.getRed();
    var green = px.getGreen();
    var blue = px.getBlue();
    var redDiff = 0 - red;
    var greenDiff = 255 - green;
    var blueDiff = 0 - blue;
    var greenDistance = Math.sqrt(redDiff * redDiff + greenDiff * greenDiff + blueDiff * blueDiff);
    return greenDistance;
}

// for each pixel of an image, decide if it is close enough to the green. If it is, than change the pixel.
function applyGreenscreenWithGreenDistance(){
    for(var pixel of fgImage.values()){
        // if the current pixel is considered green-like
        if (calcGreenDistance(pixel) < sliderValue){
            // get the x,y cordinates of the current pixel
            var fgx = pixel.getX();
            var fgy = pixel.getY();
            // get the bgimage pixel at the same cordinates
            var bgpix = bgImage.getPixel(fgx, fgy);
            // set all the values of the foreground pixel to the corresponding values of the corresponding background pixel
            pixel.setAllFrom(bgpix);
        }
    }
}

// it returns the difference of the green and the second strongest color, the greater difference meaning greener color
function calcGreenAdvantege(px){
    var red = px.getRed();
    var green = px.getGreen();
    var blue = px.getBlue();
    var secondStrongestColor;
    var diff = 0;
    if (red < green && blue < green){
        if (red >= blue){
            secondStrongestColor = red;
        }
        else{
            secondStrongestColor = blue;
        }
        diff = green - secondStrongestColor;
    }
    return diff;  
}

// for each pixel of an image, decide is the difference of the green and the second strongest color great enough to consider as green. If it is, than change the pixel.
function applyGreenscreenWithGreenAdvantage(){
    for(var pixel of fgImage.values()){
        // if the current pixel is green-like
        if (calcGreenAdvantege(pixel) > sliderValue){
            // get the x,y cordinates of the current pixel
            var fgx = pixel.getX();
            var fgy = pixel.getY();
            // get the bgimage pixel at the same cordinates
            var bgpix = bgImage.getPixel(fgx, fgy);
            // set all the values of the foreground pixel to the corresponding values of the corresponding background pixel
            pixel.setAllFrom(bgpix);
        }
    }
}

// using the algorithms above, change the background of the foreground image
function doGreenScreen(){
    // check the images are loaded
    if(fgImage == null || ! fgImage.complete()){
        alert("Foreground image is not loaded!");
    }
    if(bgImage == null || ! bgImage.complete()){
        alert("Background image is not loaded!");  
    }
    // check the images are the same size. If they are different, return with an alert.
    if(!sameSizeImages(fgImage, bgImage)){
        alert("Images should be the same size! Use the crop images button!");
        return;
    }
    // according to the choosen radio button, use the corresponding background changing algorithm
    else {
        if(document.getElementById("greendistancefunc").checked){
            applyGreenscreenWithGreenDistance();
        }
        if(document.getElementById("greenadvantagefunc").checked){
            applyGreenscreenWithGreenAdvantage();
        }
    }
    // get the js representation of the first canvas
    var canvas1 = document.getElementById("can1");
    // display the new image in the first canvas
    drawToCanvas(canvas1, fgImage);
    // get the js representation of the second canvas
    var canvas2 = document.getElementById("can2");
    // get the context of the second canvas
    var ctx2 = canvas2.getContext('2d');
    // clear the whole second canvas
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height); 
} 

 // clear the canvases
function clearCanvas(){
    // get the js representation of both canvases
    var canvas1 = document.getElementById("can1");
    var canvas2 = document.getElementById("can2");
    // get their contexts
    var ctx1 = canvas1.getContext('2d');
    var ctx2 = canvas2.getContext('2d');
    // clear the whole canvases
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    // reset the file input elements to null.
    var fimg = document.getElementById("foregroundFileInput");
    fimg.value = null;
    var bimg = document.getElementById("backgroundFileInput");
    bimg.value = null;
}