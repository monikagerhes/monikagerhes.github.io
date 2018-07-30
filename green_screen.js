var fgImage = null;
var bgImage = null;
var sldrvalue = 190;

// supplied by Viktor
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

function loadForegroundImage(){
    // get input
    var fimg = document.getElementById("foregroundFileInput");
    // create a new SimpleImage
    fgImage = new SimpleImage(fimg);
    // get access to the first canvas
    var canvas1 = document.getElementById("can1");
    // draw the image to the canvas
    //fgimage.drawTo(canvas1);
    drawToCanvas(canvas1, fgImage);
}

function loadBackgroundImage(){
    // get input
    var bimg = document.getElementById("backgroundFileInput");
    // create a new SimpleImage
    bgImage = new SimpleImage(bimg);
    // get access to the second canvas
    var canvas2 = document.getElementById("can2");
    // draw the image to the canvas
    //bgimage.drawTo(canvas2);
    drawToCanvas(canvas2, bgImage);
}

function inputFunction(){
    sldrvalue = document.getElementById("greenRange").value;
    document.getElementById("valuedemo").innerHTML = "Value: " + sldrvalue;
}


function resizeImagesToTheSame(){
    var img1Loaded = false;
    var img2Loaded = false;
    var canvas1 = document.getElementById("can1");
    var canvas2 = document.getElementById("can2");
    
    var wh = greatestCommonSize(fgImage, bgImage);
    alert("width: " + wh.width + " height: " + wh.height);
    fgImage = cropToSize(fgImage, wh.width, wh.height);
    bgImage = cropToSize(bgImage, wh.width, wh.height);
    
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
    
    if(w1 > w2){
        gratestCommonWidth = w2;
    }
    else{
        gratestCommonWidth = w1;
    }
    if(h1 > h2){
        gratestCommonHeight = h2;
    }
    else{
        gratestCommonHeight = h1;
    }
    return {width: gratestCommonWidth,
            height: gratestCommonHeight};
}

function cropToSize(img, commonWidth, commonHeight){
    var output = new SimpleImage(commonWidth, commonHeight);
    for(pixel of output.values()){
        var x = pixel.getX();
        var y = pixel.getY();
        var startX = x + ((img.width - commonWidth)/2);
        var startY = y + ((img.height - commonHeight)/2);
        startX = Math.round(startX);
        startY = Math.round(startY);
        var sourcePix = img.getPixel(startX, startY);
        pixel.setAllFrom(sourcePix);
    }
    return output;
}

function sameSizeImages(f, b) {
    if(f.width == b.width || f.height == b.height){
        return true;
    }
    else{
        return false;
    }
}

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

function greenComponentDiff(px){
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


function doGreenScreen(){
    // check the images are loaded
    if(fgImage == null || ! fgImage.complete()){
        alert("Foreground image is not loaded!");
    }
    if(bgImage == null || ! bgImage.complete()){
        alert("Background image is not loaded!");  
    }
    // check the images are in the same size. If they are different, return, with an alert.
    if(!sameSizeImages(fgImage, bgImage)){
        alert("Images should be the same size!");
        return;
    }
    else {
        for(var pixel of fgImage.values()){
            // if the current pixel is green
            // calculate the green threshold
            
            if (calcGreenDistance(pixel) < sldrvalue){
            //if (greenComponentDiff(pixel) > 0){
                // get the x,y cordinates of the current pixel
                var fgx = pixel.getX();
                var fgy = pixel.getY();
                // get the values of the bgimage pixel at the same cordinates
                var bgpix = bgImage.getPixel(fgx, fgy);
                // set all the values of the bgpix on the place of the current pixel of the fgimage
                pixel.setAllFrom(bgpix);
            }
            else{
                // do nothing
            }
        }
    }
    // draw the composit to the canvas
    var canvas1= document.getElementById("can1");
    //fgimage.drawTo(canvas1);
    drawToCanvas(canvas1, fgImage);
    // clear the second canvas
        // first get access to the second canvas
    var canvas2 = document.getElementById("can2");
        // get the context of the second canvas
    var ctx2 = canvas2.getContext('2d');
        // clear the canvas from(0,0) to the width and height of the canvas
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height); 
} 

function clearCanvas(){
    // get the access to both canvases
    var canvas1 = document.getElementById("can1");
    var canvas2 = document.getElementById("can2");
    // get their contexts
    var ctx1 = canvas1.getContext('2d');
    var ctx2 = canvas2.getContext('2d');
    // clear the canvas from(0,0) to the width and height of the canvas
    ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    
    var fimg = document.getElementById("foregroundFileInput");
    fimg.value = null;
    var bimg = document.getElementById("backgroundFileInput");
    bimg.value = null;
}