document.addEventListener("DOMContentLoaded", function() {
    const soundSlider = document.getElementById("sound-slider");
    const soundHandle = soundSlider.querySelector(".handle");
    const musicSlider = document.getElementById("music-slider");
    const musicHandle = musicSlider.querySelector(".handle");

    // Event Listeners for Dragging
    soundHandle.addEventListener("mousedown", startDrag);
    musicHandle.addEventListener("mousedown", startDrag);

    // Function to Start Dragging
    function startDrag(event) {
        const handle = event.target;
        const slider = handle.parentElement;

        const sliderRect = slider.getBoundingClientRect();
        const handleRect = handle.getBoundingClientRect();

        const offsetX = event.clientX - handleRect.left;

        document.addEventListener("mousemove", dragHandle);
        document.addEventListener("mouseup", stopDrag);

        // Function to Handle Dragging
        function dragHandle(event) {
            let newX = event.clientX - sliderRect.left - offsetX;
            if (newX < 0) {
                newX = 0;
            } else if (newX > sliderRect.width - handleRect.width) {
                newX = sliderRect.width - handleRect.width;
            }
            handle.style.left = newX + "px";
        }

        // Function to Stop Dragging
        function stopDrag() {
            document.removeEventListener("mousemove", dragHandle);
            document.removeEventListener("mouseup", stopDrag);
        }
    }
});
