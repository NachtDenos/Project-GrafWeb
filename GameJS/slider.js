document.addEventListener("DOMContentLoaded", function() {
    let fb = new Firebase("https://kollector-chicken-default-rtdb.firebaseio.com/data");

    const sliderEffects = document.getElementById('sliderEffects');
    const knobEffects = document.getElementById('knobEffects');
    const sliderMusic = document.getElementById('sliderMusic');
    const knobMusic = document.getElementById('knobMusic');

    let isDraggingEffects = false;
    let knobOffsetEffects = 0;
    let isDraggingMusic = false;
    let knobOffsetMusic = 0;

    let valueEffect = 100; 
    let valueMusic = 100; 

    fb.child("General").child("Configuration").once("value", function(snapshot) {
        if (snapshot.exists()) {
            console.log('snapshot exists');
            console.log(snapshot);
            valueEffect = snapshot.val().effects;
            valueMusic = snapshot.val().music;
            console.log(valueEffect);
            console.log(valueMusic);
            knobEffects.style.left = `${(valueEffect / 100) * (sliderEffects.offsetWidth - knobEffects.offsetWidth)}px`;
            knobMusic.style.left = `${(valueMusic / 100) * (sliderMusic.offsetWidth - knobMusic.offsetWidth)}px`;
        } else {
            console.log("No data found.");
        }
    }, function(error) {
        console.error("Error fetching data:", error);
    });

    function moveKnobEffects(event) {
        if (isDraggingEffects) {
            let posX = event.clientX || event.touches[0].clientX;
            let newPosition = posX - sliderEffects.offsetLeft - knobOffsetEffects;
            let maxPosition = sliderEffects.offsetWidth - knobEffects.offsetWidth+29;

            console.log('maxPosition:',maxPosition);
            console.log('newPosition:',newPosition);
            // Restrict knob movement within sliderEffects bounds
            if (newPosition >= 0 && newPosition <= maxPosition) {
                knobEffects.style.left = newPosition + 'px';

                let percentage = (newPosition / maxPosition) * 100;
                valueEffect = Math.round(percentage);
                if(valueEffect > 100)
                valueEffect = 100;
                if(valueEffect < 0)
                valueEffect = 0;
                console.log('Effects value: ',valueEffect);
                fb.child("General").child("Configuration").update({
                    effects: valueEffect
                });
            }
        }
    }

    function moveKnobMusic(event) {
        if (isDraggingMusic) {
            let posX = event.clientX || event.touches[0].clientX;
            let newPosition = posX - sliderMusic.offsetLeft - knobOffsetMusic;
            let maxPosition = sliderMusic.offsetWidth - knobMusic.offsetWidth+29;
            console.log(maxPosition);
            console.log(newPosition);
            // Restrict knob movement within sliderEffects bounds
            if (newPosition >= 0 && newPosition <= maxPosition) {
                knobMusic.style.left = newPosition + 'px';

                let percentage = (newPosition / maxPosition) * 100;
                valueMusic = Math.round(percentage);
                if(valueMusic > 100)
                    valueMusic = 100;
                if(valueMusic < 0)
                    valueMusic = 0;
                console.log('Music value: ',valueMusic);
                fb.child("General").child("Configuration").update({
                    music: valueMusic
                });
            }
        }
    }

    knobEffects.addEventListener('mousedown', (event) => {
        isDraggingEffects = true;
        knobOffsetEffects = event.clientX - knobEffects.getBoundingClientRect().left;
    });

    sliderEffects.addEventListener('mousemove', moveKnobEffects);

    knobEffects.addEventListener('touchstart', (event) => {
        isDraggingEffects = true;
        knobOffsetEffects = event.touches[0].clientX - knobEffects.getBoundingClientRect().left;
    });

    sliderEffects.addEventListener('touchmove', (event) => {
        moveKnobEffects(event.touches[0]);
        event.preventDefault(); // Prevent scrolling on touch devices
    });


    knobMusic.addEventListener('mousedown', (event) => {
        isDraggingMusic = true;
        knobOffsetMusic = event.clientX - knobMusic.getBoundingClientRect().left;
    });

    sliderMusic.addEventListener('mousemove', moveKnobMusic);
    
    knobMusic.addEventListener('touchstart', (event) => {
        isDraggingMusic = true;
        knobOffsetMusic = event.touches[0].clientX - knobMusic.getBoundingClientRect().left;
    });

    sliderMusic.addEventListener('touchmove', (event) => {
        moveKnobMusic(event.touches[0]);
        event.preventDefault(); // Prevent scrolling on touch devices
    });


    window.addEventListener('mouseup', () => {
        isDraggingEffects = false;
        isDraggingMusic = false;
    });
    
    window.addEventListener('touchend', () => {
        isDraggingEffects = false;
        isDraggingMusic = false;
    });
    
});
