(function (context) {
  const img_types = ['image/jpeg', 'image/png'];

  let img = null,
    compress_img = null,
    crop_obj = null;

  function crop() {
    const obj = new cropImg({
      target: 'box',
      callback({
        left,
        top,
        width,
        height,
        container_height,
        container_width,
      }) {
        const canvas_bak = document.createElement('CANVAS');
        const ctx_bak = canvas_bak.getContext('2d');
        canvas_bak.width = container_width;
        canvas_bak.height = container_height;
        ctx_bak.drawImage(img, 0, 0, container_width, container_height);

        const canvas = document.createElement('CANVAS');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(
          canvas_bak,
          left,
          top,
          width,
          height,
          0,
          0,
          width,
          height
        );

        const value = Number(document.getElementById('sel').value);
        const code = canvas.toDataURL('image/jpeg', value);
        const image = new Image();
        image.src = code;
        image.onload = () => {
          const des = document.getElementById('production');
          des.innerHTML = '';
          des.appendChild(image);
          compress_img = image;
        };
      },
    });

    return obj;
  }

  /**
   * 给input绑定事件
   */
  async function updateFile(e) {
    const file = e.target.files[0];

    if (!verify(file)) {
      //参数校验
      return false;
    }

    const base64Code = await getBase64(file); //获取base64编码

    placeImg(base64Code); //放置图片
  }

  /**
   * 下载图片
   * @param {*}
   */
  function generate() {
    if (!compress_img) {
      return false;
    }
    const a = document.createElement('A');
    a.href = compress_img.src;
    a.download = 'download';
    a.click();
  }

  /**
   * 压缩图片
   */
  function compress() {
    if (!img) {
      return false;
    }
    const value = Number(document.getElementById('sel').value);
    const canvas = document.createElement('CANVAS');
    const w = parseInt(img.style.width),
      h = parseInt(img.style.height);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, w, h);
    const code = canvas.toDataURL('image/jpeg', value);
    const image = new Image();
    image.src = code;
    image.onload = () => {
      const des = document.getElementById('production');
      des.innerHTML = '';
      des.appendChild(image);
      compress_img = image;
    };
  }

  function mosaic() {
    if (!img) {
      return false;
    }
    const value = Number(document.getElementById('sel').value);
    var myCanvas = document.getElementById('myCanvas');
    const w = parseInt(img.style.width),
      h = parseInt(img.style.height);
      myCanvas.width = w;
    myCanvas.height = h;
    var painting = myCanvas.getContext('2d');
      //生成一个图片节点
      
    painting.drawImage(img, 0, 0, w, h);
    const code = myCanvas.toDataURL('image/jpeg', value);
    const image = new Image();
    image.src = code;

    drawImg(image);

    function drawImg(image) {
      //图片加载后执行马赛克实现语句：5个一组取到随机像素赋给新图里的五个一组
      image.onload = function() {
          painting.drawImage(image, 0, 0, 250, 400);

          var size = 5;
          //获取老图所有像素点
          var oldImg = painting.getImageData(0, 0, 250, 400)
          //创建新图像素对象
          var newImg = painting.createImageData(250, 400)

          for(var i = 0; i < oldImg.width; i++) {
              for(var j = 0; j < oldImg.height; j++) {
                  //从5*5中获取单个像素信息
                  var color = getPxInfo(oldImg, Math.floor(i * size + Math.random() * size), Math.floor(j * size + Math.random() * size))

                  //写入单个像素信息
                  for(var a = 0; a < size; a++) {
                      for(var b = 0; b < size; b++) {
                          setPxInfo(newImg, i * size + a, j * size + b, color);
                      }
                  }

              }

          }
          painting.putImageData(newImg, 250, 0)
      }
  } 
}
 //读取单个像素信息
 function getPxInfo(imgDate, x, y) {
  var colorArr = [];

  var width = imgDate.width;

  colorArr[0] = imgDate.data[(width * y + x) * 4 + 0]
  colorArr[1] = imgDate.data[(width * y + x) * 4 + 1]
  colorArr[2] = imgDate.data[(width * y + x) * 4 + 2]
  colorArr[3] = imgDate.data[(width * y + x) * 4 + 3]

  return colorArr;

}

//写入单个像素信息
function setPxInfo(imgDate, x, y, colors) {
  //（x,y） 之前有多少个像素点  ==  width*y + x
  var width = imgDate.width;

  imgDate.data[(width * y + x) * 4 + 0] = colors[0];
  imgDate.data[(width * y + x) * 4 + 1] = colors[1];
  imgDate.data[(width * y + x) * 4 + 2] = colors[2];
  imgDate.data[(width * y + x) * 4 + 3] = colors[3];

}

  /**
   * 给图片设置合适的宽高放置在容器中
   */
  function placeImg(code) {
    const target = document.getElementById('original');
    const max_width = parseInt(getComputedStyle(target).width);
    const max_height = parseInt(getComputedStyle(target).height);
    let width, height;
    const image = new Image();
    image.src = code;
    image.onload = () => {
      const naturalWidth = image.naturalWidth;
      const naturalHeight = image.naturalHeight;
      const radio = naturalWidth / naturalHeight;
      if (radio >= 1) {
        //宽比高大
        width = naturalWidth < max_width ? naturalWidth : max_width;
        height = (width * 1) / radio;
        if (height > max_height) {
          height = max_height;
          width = height * radio;
        }
      } else {
        height = naturalHeight < max_height ? naturalHeight : max_height;
        width = height * radio;
        if (width > max_width) {
          width = max_width;
          height = (width * 1) / radio;
        }
      }
      width = parseInt(width);
      height = parseInt(height);
      const box = document.getElementById('box');
      box.style.width = `${width}px`;
      box.style.height = `${height}px`;
      image.style.width = `${width}px`;
      image.style.height = `${height}px`;
      box.style.background = `url(${code}) no-repeat`;
      box.style.backgroundSize = '100% 100%';
      img = image;
      compress();
    };
  }

  /**
   * 参数校验
   * @param {*} file
   */
  function verify(file) {
    const { size, type } = file;
    if (size > 5 * 1024 * 1024) {
      alert('上传图片大小不能超过5M');
      return false;
    }
    if (!img_types.includes(type)) {
      alert('请上传图片');
      return false;
    }
    return true;
  }

  function getBase64(file) {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.onload = (e) => {
        resolve(e.target.result);
      };
      fileReader.readAsDataURL(file);
    });
  }

  context.updateFile = updateFile;

  context.mosaic = mosaic;

  context.compress = compress;

  context.generate = generate;

  context.crop = function () {
    if (crop_obj || !img) {
      return false;
    }
    crop_obj = crop();
  };
})(window);
