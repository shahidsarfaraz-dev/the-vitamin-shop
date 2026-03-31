window.addEventListener('load', () => {
  document.querySelectorAll('input[type="checkbox"][id^="popuptoggle"]').forEach(element => {
    const popupToggleKey = element.id

    if (!localStorage.getItem(popupToggleKey)) {
      const popupContainer = element.parentNode.querySelector(".popup-container")
      let timeout = getComputedStyle(popupContainer).getPropertyValue('--open-delay')

      if (!timeout) {
        timeout = 10
      }
      timeout *= 1000

      setTimeout(() => {
        element.checked = true
  
        element.addEventListener('change', localStorage.setItem(popupToggleKey, 1))
        const form = popupContainer.querySelector("form")
        if (form) {
          form.addEventListener("submit", () => localStorage.setItem(popupToggleKey, 1))
        }
      }, timeout)
    }
  })
})