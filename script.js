// Configurare video-uri
const videos = [
  { name: 'Alahuahbar', displayName: 'Alahuahbar' },
  { name: 'MotoTestRide', displayName: 'Moto Test Ride' },
  { name: 'OneHandRidingTransfagarasanTunnel', displayName: 'One Hand Riding' },
  { name: 'QuackedTooHard', displayName: 'Quacked Too Hard' }
];

// Variabile globale
let currentVideoIndex = Math.floor(videos.length / 2); // Începe cu video-ul din mijloc
let draggedVideo = null;
let inventorySlots = [];
let isPlaying = false;
let carouselVisible = true;
let inventoryVisible = true;
let isDragging = false;
let draggedElement = null;

console.log('Initial currentVideoIndex:', currentVideoIndex, 'videos.length:', videos.length);

// Componenta pentru thumbnails
AFRAME.registerComponent('carousel-thumb', {
  init: function() {
    this.el.addEventListener('click', () => {
      if (!carouselVisible) return; // Nu permite click când carousel-ul e invizibil
      const videoIndex = parseInt(this.el.getAttribute('data-video-index'));
      console.log('Thumbnail clicked:', this.el.getAttribute('data-video-name'));
      selectVideo(videoIndex);
    });
  }
});

// Componenta pentru butoane de navigare
AFRAME.registerComponent('nav-button', {
  init: function() {
    this.el.addEventListener('click', () => {
      if (!carouselVisible) return; // Nu permite click când carousel-ul e invizibil
      const direction = this.el.getAttribute('data-direction');
      console.log('Navigation button clicked:', direction);
      if (direction === 'left') {
        navigateCarousel(-1);
      } else if (direction === 'right') {
        navigateCarousel(1);
      }
    });
  }
});

// Componenta pentru butonul play/pause
AFRAME.registerComponent('control-button', {
  init: function() {
    this.el.addEventListener('click', () => {
      const action = this.el.getAttribute('data-action');
      console.log('Control button clicked:', action);
      if (action === 'play') {
        togglePlayPause();
      }
    });
  }
});

// Componenta pentru butoane toggle
AFRAME.registerComponent('toggle-button', {
  init: function() {
    this.el.addEventListener('click', () => {
      const target = this.el.getAttribute('data-target');
      console.log('Toggle button clicked:', target);
      if (target === 'carousel') {
        toggleCarouselVisibility();
      } else if (target === 'inventory') {
        toggleInventoryVisibility();
      }
    });
  }
});

// Componenta pentru sloturi de inventar
AFRAME.registerComponent('inventory-slot', {
  init: function() {
    this.el.addEventListener('click', () => {
      if (!inventoryVisible) return; // Nu permite click când inventarul e invizibil
      const slotIndex = parseInt(this.el.getAttribute('data-slot-index'));
      const videoName = this.el.getAttribute('data-video-name');
      
      if (videoName) {
        console.log('Inventory slot clicked, selecting video:', videoName);
        // Găsește index-ul video-ului în lista de video-uri
        const videoIndex = videos.findIndex(v => v.name === videoName);
        if (videoIndex !== -1) {
          selectVideo(videoIndex);
        }
      } else {
        console.log('Inventory slot clicked but no video in slot:', slotIndex);
      }
    });
  }
});

// Inițializare când A-Frame e gata
AFRAME.registerComponent('app-init', {
  init: function() {
    console.log('A-Frame component initialized');
    // Așteaptă puțin ca A-Frame să se inițializeze complet
    setTimeout(() => {
      console.log('Starting initialization...');
      createCarousel();
      createInventory();
      updateVideoPlayer();
      updateNavigationArrows();
      setupDragAndDrop();
      console.log('Initialization complete');
      
      // Forțează săgețile să fie vizibile după inițializare și să se actualizeze corect
      setTimeout(() => {
        console.log('Final arrow update, currentVideoIndex:', currentVideoIndex);
        updateNavigationArrows();
      }, 500);
    }, 1000);
  }
});

// Toggle vizibilitate carousel
function toggleCarouselVisibility() {
  carouselVisible = !carouselVisible;
  const container = document.querySelector('#carousel-container');
  const leftArrow = document.querySelector('#leftArrow');
  const rightArrow = document.querySelector('#rightArrow');
  
  if (container) {
    container.setAttribute('visible', carouselVisible);
  }
  if (leftArrow) {
    leftArrow.setAttribute('visible', carouselVisible);
  }
  if (rightArrow) {
    rightArrow.setAttribute('visible', carouselVisible);
  }
  
  console.log('Carousel visibility:', carouselVisible);
}

// Toggle vizibilitate inventar
function toggleInventoryVisibility() {
  inventoryVisible = !inventoryVisible;
  const container = document.querySelector('#inventory-container');
  
  if (container) {
    container.setAttribute('visible', inventoryVisible);
  }
  
  console.log('Inventory visibility:', inventoryVisible);
}

// Creează carousel circular cu limitare
function createCarousel() {
  console.log('Creating carousel...');
  const container = document.querySelector('#carousel-container');
  if (!container) {
    console.error('Carousel container not found');
    return;
  }
  
  const radius = 1.2;
  const maxAngle = Math.PI * 0.8; // Limitează rotația la ~144 grade în loc de 360
  
  videos.forEach((video, index) => {
    const angle = (index / (videos.length - 1)) * maxAngle - maxAngle / 2; // Distribuie pe arc limitat
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius * 0.6;
    
    const thumb = document.createElement('a-plane');
    thumb.setAttribute('id', `carousel-thumb-${index}`);
    thumb.setAttribute('src', `#${video.name}-thumb`);
    thumb.setAttribute('position', `${x} 0 ${z}`);
    thumb.setAttribute('width', '0.6');
    thumb.setAttribute('height', '0.35');
    thumb.setAttribute('class', 'carousel-thumb');
    thumb.setAttribute('data-video-index', index);
    thumb.setAttribute('data-video-name', video.name);
    thumb.setAttribute('carousel-thumb', '');
    thumb.setAttribute('raycastable', ''); // Make it detectable by cursor
    
    container.appendChild(thumb);
    console.log(`Created thumbnail ${index} for ${video.name}`);
  });
  
  // Aplică focus-ul inițial
  updateCarouselFocus();
}

// Actualizează focus-ul pe carousel (thumbnail-ul selectat în centru, mai mare)
function updateCarouselFocus() {
  const container = document.querySelector('#carousel-container');
  if (!container) return;
  
  const radius = 1.2;
  const maxAngle = Math.PI * 0.8;
  
  videos.forEach((video, index) => {
    const thumb = document.querySelector(`#carousel-thumb-${index}`);
    if (!thumb) return;
    
    // Calculează poziția pentru thumbnail-ul curent
    // Ajustează offset-ul pentru a pune thumbnail-ul selectat în centru
    const adjustedIndex = index - currentVideoIndex;
    const angle = (adjustedIndex / (videos.length - 1)) * maxAngle;
    const x = Math.sin(angle) * radius;
    const z = Math.cos(angle) * radius * 0.6;
    
    // Aplică poziția
    thumb.setAttribute('position', `${x} 0 ${z}`);
    
    // Aplică focus-ul (scale și opacitate) bazat pe distanța de la centru
    const distanceFromCenter = Math.abs(adjustedIndex);
    
    if (distanceFromCenter === 0) {
      // Thumbnail-ul selectat - mai mare și mai luminos, în centru
      thumb.setAttribute('scale', '1.2 1.2 1');
      thumb.setAttribute('color', '#ffffff');
      thumb.setAttribute('opacity', '1.0');
    } else if (distanceFromCenter === 1) {
      // Thumbnail-urile adiacente - mărime normală, puțin mai întunecate
      thumb.setAttribute('scale', '1.0 1.0 1');
      thumb.removeAttribute('color');
      thumb.setAttribute('opacity', '0.8');
    } else {
      // Thumbnail-urile îndepărtate - mai mici și mai întunecate
      thumb.setAttribute('scale', '0.8 0.8 1');
      thumb.removeAttribute('color');
      thumb.setAttribute('opacity', '0.6');
    }
  });
}

// Creează inventar cu sloturi
function createInventory() {
  console.log('Creating inventory...');
  const container = document.querySelector('#inventory-container');
  if (!container) {
    console.error('Inventory container not found');
    return;
  }
  
  const slotCount = 5;
  const spacing = 0.6;
  
  for (let i = 0; i < slotCount; i++) {
    const slot = document.createElement('a-plane');
    slot.setAttribute('id', `inventory-slot-${i}`);
    slot.setAttribute('position', `${(i - (slotCount - 1) / 2) * spacing} 0 0`);
    slot.setAttribute('width', '0.5');
    slot.setAttribute('height', '0.3');
    slot.setAttribute('color', '#444444');
    slot.setAttribute('class', 'inventory-slot');
    slot.setAttribute('data-slot-index', i);
    slot.setAttribute('inventory-slot', '');
    slot.setAttribute('raycastable', ''); // Make it detectable by cursor
    
    container.appendChild(slot);
    inventorySlots.push(slot);
    console.log(`Created inventory slot ${i}`);
  }
}

// Actualizează player-ul video
function updateVideoPlayer() {
  const videoPlayer = document.querySelector('#videoPlayer');
  const videoTitle = document.querySelector('#videoTitle');
  
  if (!videoPlayer || !videoTitle) {
    console.error('Video player or title not found');
    return;
  }
  
  const video = videos[currentVideoIndex];
  console.log('Updating video player to:', video.name);
  
  // Oprește toate video-urile înainte de a schimba
  videos.forEach(v => {
    const vid = document.getElementById(v.name);
    if (vid) {
      vid.pause();
      vid.currentTime = 0; // Resetează la început
    }
  });
  
  videoPlayer.setAttribute('src', `#${video.name}`);
  videoTitle.setAttribute('value', video.displayName);
  
  // Resetează starea de play
  isPlaying = false;
  updatePlayButton(false);
}

// Toggle play/pause
function togglePlayPause() {
  console.log('Toggle play/pause called');
  const video = document.getElementById(videos[currentVideoIndex].name);
  if (!video) {
    console.error('Video element not found:', videos[currentVideoIndex].name);
    return;
  }
  
  if (isPlaying) {
    video.pause();
    isPlaying = false;
    updatePlayButton(false);
    console.log('Video paused');
  } else {
    // Oprește toate celelalte video-uri înainte de a porni pe cel curent
    videos.forEach((v, index) => {
      if (index !== currentVideoIndex) {
        const otherVideo = document.getElementById(v.name);
        if (otherVideo) {
          otherVideo.pause();
          otherVideo.currentTime = 0;
        }
      }
    });
    
    video.play().then(() => {
      isPlaying = true;
      updatePlayButton(true);
      console.log('Video started playing');
    }).catch(err => {
      console.error('Error playing video:', err);
    });
  }
}

// Actualizează butonul play/pause
function updatePlayButton(playing) {
  const playButton = document.querySelector('#playButton');
  if (playButton) {
    if (playing) {
      playButton.setAttribute('color', '#ff0000');
      // Schimbă textul la pause
      const playText = document.querySelector('#playButton').nextElementSibling;
      if (playText && playText.tagName === 'A-TEXT') {
        playText.setAttribute('value', '⏸');
      }
    } else {
      playButton.setAttribute('color', '#00ff00');
      // Schimbă textul la play
      const playText = document.querySelector('#playButton').nextElementSibling;
      if (playText && playText.tagName === 'A-TEXT') {
        playText.setAttribute('value', '▶');
      }
    }
  }
}

// Selectează video-ul
function selectVideo(index) {
  console.log('Selecting video:', index, videos[index].name);
  currentVideoIndex = index;
  updateVideoPlayer();
  updateCarouselHighlight();
  // Resetează starea de play
  isPlaying = false;
  updatePlayButton(false);
}

// Navigare carousel cu limitare
function navigateCarousel(direction) {
  console.log('Navigating carousel:', direction);
  currentVideoIndex += direction;
  currentVideoIndex = Math.max(0, Math.min(currentVideoIndex, videos.length - 1));
  updateCarouselPosition();
  updateNavigationArrows();
  updateVideoPlayer(); // Actualizează și player-ul când navighezi
}

// Actualizează poziția carousel-ului cu limitare
function updateCarouselPosition() {
  updateCarouselFocus(); // Folosește funcția de focus în loc de poziționare simplă
}

// Actualizează săgețile de navigare (ascunde la capete)
function updateNavigationArrows() {
  const leftArrow = document.querySelector('#leftArrow');
  const rightArrow = document.querySelector('#rightArrow');
  
  console.log('Updating navigation arrows, carouselVisible:', carouselVisible, 'currentVideoIndex:', currentVideoIndex);
  console.log('Left arrow found:', !!leftArrow, 'Right arrow found:', !!rightArrow);
  
  if (leftArrow && rightArrow) {
    // Forțează săgețile să fie vizibile dacă carousel-ul e vizibil
    if (carouselVisible) {
      // Ascunde săgeata stânga dacă suntem la început (index 0)
      if (currentVideoIndex <= 0) {
        leftArrow.setAttribute('visible', false);
        console.log('Left arrow hidden (at start)');
      } else {
        leftArrow.setAttribute('visible', true);
        console.log('Left arrow visible');
      }
      
      // Ascunde săgeata dreapta dacă suntem la sfârșit
      if (currentVideoIndex >= videos.length - 1) {
        rightArrow.setAttribute('visible', false);
        console.log('Right arrow hidden (at end)');
      } else {
        rightArrow.setAttribute('visible', true);
        console.log('Right arrow visible');
      }
    } else {
      // Dacă carousel-ul e invizibil, ascunde ambele săgeți
      leftArrow.setAttribute('visible', false);
      rightArrow.setAttribute('visible', false);
      console.log('Both arrows hidden (carousel invisible)');
    }
  } else {
    console.error('Navigation arrows not found!');
    console.log('Available elements with "arrow" in id:');
    document.querySelectorAll('[id*="arrow"]').forEach(el => {
      console.log('-', el.id, el.tagName);
    });
  }
}

// Actualizează highlight-ul pe thumbnail-ul selectat
function updateCarouselHighlight() {
  // Această funcție este înlocuită de updateCarouselFocus()
  updateCarouselFocus();
}

// Setează video în slot
function setSlot(slotIndex, videoName) {
  console.log('Setting slot:', slotIndex, 'with video:', videoName);
  const slot = document.querySelector(`#inventory-slot-${slotIndex}`);
  if (slot) {
    slot.setAttribute('src', `#${videoName}-thumb`);
    slot.setAttribute('data-video-name', videoName);
    slot.setAttribute('color', '#ffffff');
  }
}

// Curăță slot
function clearSlot(slotIndex) {
  console.log('Clearing slot:', slotIndex);
  const slot = document.querySelector(`#inventory-slot-${slotIndex}`);
  if (slot) {
    slot.removeAttribute('src');
    slot.removeAttribute('data-video-name');
    slot.setAttribute('color', '#444444');
  }
}

// Setup drag & drop functionality
function setupDragAndDrop() {
  console.log('Setting up drag and drop...');
  
  // Use A-Frame's cursor events for 3D interaction
  const cursor = document.querySelector('[cursor]');
  if (!cursor) {
    console.error('Cursor not found');
    return;
  }
  
  // Mouse down event - start drag (only with Alt key to avoid conflict with navigation and browser context menu)
  document.addEventListener('mousedown', (event) => {
    // Only start drag if Alt key is pressed (to avoid conflict with look-controls and browser context menu)
    if (!event.altKey) return;
    if (!inventoryVisible) return; // Nu permite drag când inventarul e invizibil
    
    // Prevent default to avoid conflicts
    event.preventDefault();
    
    // Get the currently intersected object from A-Frame's raycaster
    const intersectedEl = cursor.components.raycaster.intersectedEls[0];
    if (!intersectedEl) return;
    
    if (intersectedEl.classList.contains('carousel-thumb')) {
      // Starting drag from carousel
      isDragging = true;
      draggedElement = intersectedEl;
      draggedVideo = intersectedEl.getAttribute('data-video-name');
      console.log('Started dragging video:', draggedVideo);
      
      // Visual feedback
      intersectedEl.setAttribute('scale', '0.9 0.9 1');
      intersectedEl.setAttribute('opacity', '0.7');
    } else if (intersectedEl.classList.contains('inventory-slot')) {
      // Starting drag from inventory
      const slotIndex = parseInt(intersectedEl.getAttribute('data-slot-index'));
      const videoName = intersectedEl.getAttribute('data-video-name');
      
      if (videoName) {
        isDragging = true;
        draggedElement = intersectedEl;
        draggedVideo = videoName;
        console.log('Started dragging from inventory slot:', slotIndex, 'video:', videoName);
        
        // Visual feedback
        intersectedEl.setAttribute('scale', '0.9 0.9 1');
        intersectedEl.setAttribute('opacity', '0.7');
      }
    }
  });
  
  // Mouse up event - end drag
  document.addEventListener('mouseup', (event) => {
    if (!isDragging || !draggedElement) return;
    
    // Only process if Alt key was pressed
    if (!event.altKey) return;
    
    // Prevent default to avoid conflicts
    event.preventDefault();
    
    // Get the currently intersected object from A-Frame's raycaster
    const intersectedEl = cursor.components.raycaster.intersectedEls[0];
    
    if (intersectedEl && intersectedEl.classList.contains('inventory-slot')) {
      const targetSlotIndex = parseInt(intersectedEl.getAttribute('data-slot-index'));
      
      if (draggedElement.classList.contains('carousel-thumb')) {
        // Dropping from carousel to inventory
        console.log('Dropping video from carousel to inventory slot:', targetSlotIndex);
        setSlot(targetSlotIndex, draggedVideo);
      } else if (draggedElement.classList.contains('inventory-slot')) {
        // Dropping from inventory to inventory (swap)
        const sourceSlotIndex = parseInt(draggedElement.getAttribute('data-slot-index'));
        if (sourceSlotIndex !== targetSlotIndex) {
          console.log('Swapping inventory slots:', sourceSlotIndex, 'and', targetSlotIndex);
          swapSlots(sourceSlotIndex, targetSlotIndex);
        }
      }
    } else {
      // Dropped outside inventory - remove from inventory ONLY if it was from inventory
      if (draggedElement.classList.contains('inventory-slot')) {
        const slotIndex = parseInt(draggedElement.getAttribute('data-slot-index'));
        const videoName = draggedElement.getAttribute('data-video-name');
        if (videoName) {
          console.log('Dropped outside inventory, clearing slot:', slotIndex, 'video:', videoName);
          clearSlot(slotIndex);
        }
      }
      // If dropped from carousel outside inventory, do nothing (just cancel the drag)
    }
    
    // Reset visual feedback
    if (draggedElement) {
      draggedElement.setAttribute('scale', '1 1 1');
      draggedElement.setAttribute('opacity', '1');
    }
    
    // Reset drag state
    isDragging = false;
    draggedElement = null;
    draggedVideo = null;
  });
  
  // Mouse move event - visual feedback during drag
  document.addEventListener('mousemove', (event) => {
    if (!isDragging || !draggedElement) return;
    
    // Add visual feedback during drag (optional)
    // Could add a "ghost" element that follows the mouse
  });
}

// Swap slots in inventory
function swapSlots(slotIndex1, slotIndex2) {
  console.log('Swapping slots:', slotIndex1, 'and', slotIndex2);
  
  const slot1 = document.querySelector(`#inventory-slot-${slotIndex1}`);
  const slot2 = document.querySelector(`#inventory-slot-${slotIndex2}`);
  
  if (!slot1 || !slot2) return;
  
  const video1 = slot1.getAttribute('data-video-name');
  const video2 = slot2.getAttribute('data-video-name');
  
  if (video1) {
    setSlot(slotIndex2, video1);
  } else {
    clearSlot(slotIndex2);
  }
  
  if (video2) {
    setSlot(slotIndex1, video2);
  } else {
    clearSlot(slotIndex1);
  }
} 