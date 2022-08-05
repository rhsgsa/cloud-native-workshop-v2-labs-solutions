function showQR() {
  let url = document.location.protocol + "//" + document.location.host;

  // size QR code based on viewport
  let qrSize = Math.min(window.innerWidth, window.innerHeight) * 0.6;

  let qr = new QRious({
    element: document.getElementById('qr'),
    size: qrSize,
    value: url
  });

  document.getElementById('overlay').style.display = "block";
}

function hideQR() {
  document.getElementById('overlay').style.display = "none";
}

