function updateElemPos() {
  const elementToMove = document.querySelector("#elementToMove");
  const targetPlace = document.querySelector("#targetPlace");
  const returnPlace = document.querySelector("#returnPlace");

  if (!elementToMove) return;

  const isMobile = window.innerWidth < 992;
  const isInTargetPlace = elementToMove.parentElement === targetPlace;
  const isInReturnPlace = elementToMove.parentElement === returnPlace;

  if (isMobile && !isInTargetPlace) {
    targetPlace.insertBefore(elementToMove, targetPlace.firstChild);
  } else if (!isMobile && !isInReturnPlace) {
    returnPlace.insertBefore(elementToMove, returnPlace.firstChild);
  }
}

updateElemPos();