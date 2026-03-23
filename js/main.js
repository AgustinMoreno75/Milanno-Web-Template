if ('scrollRestoration' in window.history) {
	window.history.scrollRestoration = 'manual';
}

const forceTopOnEntry = () => {
	window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
};

window.addEventListener('load', forceTopOnEntry);
window.addEventListener('pageshow', (event) => {
	if (event.persisted) {
		forceTopOnEntry();
	}
});

const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('#main-menu');
const siteHeader = document.querySelector('.site-header');
const heroSection = document.querySelector('.hero');
const heroPanel = document.querySelector('.hero-panel');
const navPill = navMenu ? navMenu.querySelector('.nav-pill') : null;
const navSectionLinks = Array.from(document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)'));

const updateNavPill = (activeLink) => {
	if (!navMenu || !navPill || !activeLink) {
		return;
	}

	if (window.innerWidth <= 900) {
		navMenu.classList.remove('has-pill-ready');
		return;
	}

	const menuRect = navMenu.getBoundingClientRect();
	const linkRect = activeLink.getBoundingClientRect();
	const left = linkRect.left - menuRect.left;
	const top = linkRect.top - menuRect.top;

	navMenu.style.setProperty('--pill-left', `${left}px`);
	navMenu.style.setProperty('--pill-top', `${top}px`);
	navMenu.style.setProperty('--pill-width', `${linkRect.width}px`);
	navMenu.style.setProperty('--pill-height', `${linkRect.height}px`);
	navMenu.classList.add('has-pill-ready');

	navPill.classList.remove('is-stretching');
	window.requestAnimationFrame(() => {
		navPill.classList.add('is-stretching');
		window.setTimeout(() => {
			navPill.classList.remove('is-stretching');
		}, 180);
	});
};

const setActiveNavLink = (hash) => {
	if (!navSectionLinks.length) {
		return;
	}

	let activeLink = null;

	navSectionLinks.forEach((link) => {
		const isActive = link.getAttribute('href') === hash;
		link.classList.toggle('menu-active', isActive);
		if (isActive) {
			activeLink = link;
		}
	});

	if (activeLink) {
		window.requestAnimationFrame(() => updateNavPill(activeLink));
	}
};

const refreshActivePillPosition = () => {
	if (!navSectionLinks.length) {
		return;
	}

	const activeLink = navSectionLinks.find((link) => link.classList.contains('menu-active'));
	if (activeLink) {
		window.requestAnimationFrame(() => updateNavPill(activeLink));
	}
};

if (navSectionLinks.length) {
	navSectionLinks.forEach((link) => {
		link.addEventListener('click', (event) => {
			const hash = link.getAttribute('href');
			if (!hash) {
				return;
			}

			event.preventDefault();
			setActiveNavLink(hash);

			if (hash === '#inicio') {
				window.scrollTo({ top: 0, behavior: 'smooth' });
				history.replaceState(null, '', '#inicio');
				return;
			}

			const target = document.querySelector(hash);
			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
				history.replaceState(null, '', hash);
			}
		});
	});

	const linkedSections = navSectionLinks
		.map((link) => {
			const hash = link.getAttribute('href');
			if (!hash) {
				return null;
			}

			const section = document.querySelector(hash);
			return section ? { hash, section } : null;
		})
		.filter(Boolean);

	const updateActiveByScroll = () => {
		if (!linkedSections.length) {
			return;
		}

		const headerOffset = (siteHeader ? siteHeader.offsetHeight : 0) + 24;
		const scrollPosition = window.scrollY + headerOffset;
		let activeHash = '#inicio';

		linkedSections.forEach(({ hash, section }) => {
			if (section.offsetTop <= scrollPosition) {
				activeHash = hash;
			}
		});

		setActiveNavLink(activeHash);
	};

	setActiveNavLink('#inicio');
	updateActiveByScroll();
	window.addEventListener('scroll', updateActiveByScroll, { passive: true });
	window.addEventListener('resize', () => {
		updateActiveByScroll();
		refreshActivePillPosition();
	});
	window.addEventListener('load', refreshActivePillPosition);
	window.addEventListener('orientationchange', refreshActivePillPosition);

	if (document.fonts && 'ready' in document.fonts) {
		document.fonts.ready.then(() => {
			refreshActivePillPosition();
		});
	}

	window.setTimeout(refreshActivePillPosition, 120);
}

if (navToggle && navMenu) {
	const syncMenuState = (isOpen) => {
		navToggle.setAttribute('aria-expanded', String(isOpen));
		document.body.classList.toggle('menu-open', isOpen && window.innerWidth <= 900);
	};

	const closeMenu = () => {
		navMenu.classList.remove('is-open');
		syncMenuState(false);
	};

	navToggle.addEventListener('click', () => {
		const isOpen = navMenu.classList.toggle('is-open');
		syncMenuState(isOpen);
	});

	navMenu.querySelectorAll('a').forEach((link) => {
		link.addEventListener('click', closeMenu);
	});

	window.addEventListener('resize', () => {
		if (window.innerWidth > 900) {
			closeMenu();
		} else {
			syncMenuState(navMenu.classList.contains('is-open'));
		}
	});

	document.addEventListener('click', (event) => {
		if (window.innerWidth > 900 || !navMenu.classList.contains('is-open')) {
			return;
		}

		if (!siteHeader || siteHeader.contains(event.target)) {
			return;
		}

		closeMenu();
	});

	document.addEventListener('keydown', (event) => {
		if (event.key === 'Escape' && navMenu.classList.contains('is-open')) {
			closeMenu();
			navToggle.focus();
		}
	});
}

if (siteHeader) {
	const onScroll = () => {
		siteHeader.classList.toggle('is-scrolled', window.scrollY > 14);
	};
	siteHeader.classList.add('is-sticky');

	onScroll();
	window.addEventListener('scroll', onScroll, { passive: true });
}

const revealElements = document.querySelectorAll('.reveal-on-scroll');
if (revealElements.length) {
	if ('IntersectionObserver' in window) {
		const revealObserver = new IntersectionObserver(
			(entries, observer) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.2 }
		);

		revealElements.forEach((element) => revealObserver.observe(element));
	} else {
		revealElements.forEach((element) => element.classList.add('is-visible'));
	}
}

if (heroSection && heroPanel && window.matchMedia('(min-width: 901px)').matches) {
	heroSection.addEventListener('pointermove', (event) => {
		const bounds = heroSection.getBoundingClientRect();
		const x = (event.clientX - bounds.left) / bounds.width;
		const tilt = (x - 0.5) * 8;
		heroPanel.style.setProperty('--hero-tilt', tilt.toFixed(2));
	});

	heroSection.addEventListener('pointerleave', () => {
		heroPanel.style.setProperty('--hero-tilt', '0');
	});
}

const featuredCarousel = document.querySelector('.featured-carousel');
if (featuredCarousel) {
	const track = featuredCarousel.querySelector('.carousel-track');
	const slides = Array.from(featuredCarousel.querySelectorAll('.plate-card'));
	const prevButton = featuredCarousel.querySelector('.carousel-control.prev');
	const nextButton = featuredCarousel.querySelector('.carousel-control.next');
	const dotsContainer = document.querySelector('.carousel-dots');

	if (track && slides.length && prevButton && nextButton && dotsContainer) {
		let currentIndex = 0;
		let autoplayTimer;

		const renderDots = () => {
			dotsContainer.innerHTML = '';
			slides.forEach((slide, index) => {
				const dot = document.createElement('button');
				dot.type = 'button';
				dot.className = `carousel-dot${index === 0 ? ' is-active' : ''}`;
				dot.setAttribute('role', 'tab');
				dot.setAttribute('aria-label', `Ir a ${slide.dataset.title || `plato ${index + 1}`}`);
				dot.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
				dot.addEventListener('click', () => goToSlide(index));
				dotsContainer.appendChild(dot);
			});
		};

		const updateDots = () => {
			const dots = dotsContainer.querySelectorAll('.carousel-dot');
			dots.forEach((dot, index) => {
				dot.classList.toggle('is-active', index === currentIndex);
				dot.setAttribute('aria-selected', index === currentIndex ? 'true' : 'false');
			});
		};

		const goToSlide = (index) => {
			currentIndex = (index + slides.length) % slides.length;
			track.style.transform = `translateX(-${currentIndex * 100}%)`;
			slides.forEach((slide, slideIndex) => {
				slide.classList.toggle('is-active', slideIndex === currentIndex);
			});
			updateDots();
		};

		const startAutoplay = () => {
			clearInterval(autoplayTimer);
			autoplayTimer = setInterval(() => goToSlide(currentIndex + 1), 5000);
		};

		renderDots();
		goToSlide(0);
		startAutoplay();

		prevButton.addEventListener('click', () => {
			goToSlide(currentIndex - 1);
			startAutoplay();
		});

		nextButton.addEventListener('click', () => {
			goToSlide(currentIndex + 1);
			startAutoplay();
		});

		featuredCarousel.addEventListener('mouseenter', () => clearInterval(autoplayTimer));
		featuredCarousel.addEventListener('mouseleave', startAutoplay);
	}
}

const viewToggles = document.querySelectorAll('.view-toggle');
const menuCards = document.querySelector('#menu-cards');
const menuList = document.querySelector('#menu-list');
const menuViewSwitch = document.querySelector('.menu-view-switch');
const menuViewPill = menuViewSwitch ? menuViewSwitch.querySelector('.menu-view-pill') : null;

if (viewToggles.length && menuCards && menuList) {
	const updateMenuViewPill = (activeToggle) => {
		if (!menuViewSwitch || !menuViewPill || !activeToggle) {
			return;
		}

		const switchRect = menuViewSwitch.getBoundingClientRect();
		const toggleRect = activeToggle.getBoundingClientRect();
		const left = toggleRect.left - switchRect.left;
		const top = toggleRect.top - switchRect.top;

		menuViewSwitch.style.setProperty('--menu-pill-left', `${left}px`);
		menuViewSwitch.style.setProperty('--menu-pill-top', `${top}px`);
		menuViewSwitch.style.setProperty('--menu-pill-width', `${toggleRect.width}px`);
		menuViewSwitch.style.setProperty('--menu-pill-height', `${toggleRect.height}px`);
		menuViewSwitch.classList.add('has-pill-ready');

		menuViewPill.classList.remove('is-stretching');
		window.requestAnimationFrame(() => {
			menuViewPill.classList.add('is-stretching');
			window.setTimeout(() => {
				menuViewPill.classList.remove('is-stretching');
			}, 170);
		});
	};

	const setMenuView = (view) => {
		const showCards = view === 'cards';
		let activeToggle = null;
		menuCards.classList.toggle('is-visible', showCards);
		menuList.classList.toggle('is-visible', !showCards);

		viewToggles.forEach((toggle) => {
			const isActive = toggle.dataset.view === view;
			toggle.classList.toggle('is-active', isActive);
			toggle.setAttribute('aria-pressed', isActive ? 'true' : 'false');
			if (isActive) {
				activeToggle = toggle;
			}
		});

		if (activeToggle) {
			window.requestAnimationFrame(() => updateMenuViewPill(activeToggle));
		}
	};

	viewToggles.forEach((toggle) => {
		toggle.addEventListener('click', () => {
			setMenuView(toggle.dataset.view || 'cards');
		});
	});

	window.addEventListener('resize', () => {
		const activeToggle = Array.from(viewToggles).find((toggle) => toggle.classList.contains('is-active'));
		if (activeToggle) {
			updateMenuViewPill(activeToggle);
		}
	});

	setMenuView('cards');
}

if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
	const tactileSelector = '.nav-links a, .hero-btn, .section-link, .location-actions a, .contact-actions a, .view-toggle, .booking-cta, .floating-wa, .carousel-control, .calendar-days button';
	document.addEventListener('pointerdown', (event) => {
		if (event.pointerType === 'mouse') {
			return;
		}

		const target = event.target instanceof Element ? event.target.closest(tactileSelector) : null;
		if (!target) {
			return;
		}

		target.classList.remove('tap-pulse');
		window.requestAnimationFrame(() => {
			target.classList.add('tap-pulse');
			window.setTimeout(() => {
				target.classList.remove('tap-pulse');
			}, 180);
		});
	}, { passive: true });
}

const bookingSection = document.querySelector('.booking');
if (bookingSection) {
	const monthLabel = bookingSection.querySelector('#calendar-month-label');
	const daysContainer = bookingSection.querySelector('#calendar-days');
	const prevMonthButton = bookingSection.querySelector('.prev-month');
	const nextMonthButton = bookingSection.querySelector('.next-month');
	const dateField = bookingSection.querySelector('#reserve-date');
	const nameField = bookingSection.querySelector('#reserve-name');
	const peopleField = bookingSection.querySelector('#reserve-people');
	const timeField = bookingSection.querySelector('#reserve-time');
	const notesField = bookingSection.querySelector('#reserve-notes');
	const whatsappCta = bookingSection.querySelector('#whatsapp-cta');
	const mobileReserveCta = document.querySelector('#mobile-reserve-cta');
	const reserveFeedback = bookingSection.querySelector('#reserve-feedback');
	const phone = bookingSection.dataset.whatsappPhone || '';
	const reservationLink = 'https://api.whatsapp.com/message/UG3AYKSVWSOON1?autoload=1&app_absent=0';

	if (monthLabel && daysContainer && prevMonthButton && nextMonthButton && dateField && nameField && peopleField && timeField && notesField && whatsappCta) {
		const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
		const ctaButtons = [whatsappCta, mobileReserveCta].filter(Boolean);
		const today = new Date();
		let currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		let selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		let timeWasSelectedByUser = false;

		const formatDate = (date) => `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
		const timeToMinutes = (value) => {
			const [hours, minutes] = value.split(':').map((part) => Number(part));
			return (hours * 60) + minutes;
		};

		const setFieldValidity = (field, hasError) => {
			field.classList.toggle('is-invalid', hasError);
			field.setAttribute('aria-invalid', hasError ? 'true' : 'false');
		};

		const getSuggestedTime = (dateValue) => {
			const options = Array.from(timeField.options).map((option) => option.value).filter(Boolean);
			if (!options.length) {
				return '';
			}

			const defaultTime = timeField.dataset.defaultTime || '20:30';
			const isToday = dateValue === formatDate(new Date());

			if (!isToday) {
				if (options.includes(defaultTime)) {
					return defaultTime;
				}
				return options[Math.floor(options.length / 2)];
			}

			const now = new Date();
			const threshold = (now.getHours() * 60) + now.getMinutes() + 45;
			const nextAvailable = options.find((timeOption) => timeToMinutes(timeOption) >= threshold);

			return nextAvailable || options[options.length - 1];
		};

		const updateWhatsAppLink = () => {
			const name = nameField.value.trim();
			const people = peopleField.value;
			const time = timeField.value;
			const date = dateField.value;
			const notes = notesField.value.trim();
			const invalidName = name.length < 2;
			const invalidDate = !date;

			const missingData = invalidName || invalidDate || !phone;
			setFieldValidity(nameField, invalidName);
			setFieldValidity(dateField, invalidDate);

			const messageLines = [
				'Hola Milano, quiero reservar una mesa.',
				`Nombre: ${name || '-'}`,
				`Fecha: ${date || '-'}`,
				`Horario: ${time}`,
				`Personas: ${people}`
			];

			if (notes) {
				messageLines.push(`Comentarios: ${notes}`);
			}

			const message = encodeURIComponent(messageLines.join('\n'));
			const finalLink = missingData ? reservationLink : `https://api.whatsapp.com/send?phone=${phone}&text=${message}`;
			ctaButtons.forEach((ctaButton) => {
				ctaButton.classList.toggle('is-disabled', missingData);
				ctaButton.setAttribute('aria-disabled', String(missingData));
				ctaButton.href = finalLink;
			});

			if (reserveFeedback) {
				reserveFeedback.classList.remove('is-ok', 'is-error');
				if (missingData) {
					reserveFeedback.classList.add('is-error');
					if (invalidName) {
						reserveFeedback.textContent = 'Ingresa tu nombre para continuar con la reserva.';
					} else if (invalidDate) {
						reserveFeedback.textContent = 'Selecciona una fecha en el calendario para continuar.';
					} else {
						reserveFeedback.textContent = 'Completa los datos para habilitar la reserva directa.';
					}
				} else {
					reserveFeedback.classList.add('is-ok');
					reserveFeedback.textContent = `Todo listo. Reserva sugerida para ${people} personas a las ${time}.`;
				}
			}
		};

		const renderCalendar = () => {
			daysContainer.innerHTML = '';
			monthLabel.textContent = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;

			const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
			const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
			const mondayStartOffset = (firstDay.getDay() + 6) % 7;

			for (let i = 0; i < mondayStartOffset; i += 1) {
				const blank = document.createElement('span');
				blank.textContent = '.';
				daysContainer.appendChild(blank);
			}

			for (let day = 1; day <= daysInMonth; day += 1) {
				const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
				const button = document.createElement('button');
				button.type = 'button';
				button.textContent = String(day);
				button.setAttribute('aria-label', `Seleccionar ${formatDate(date)}`);

				const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
				button.classList.toggle('is-selected', isSelected);

				button.addEventListener('click', () => {
					selectedDate = date;
					dateField.value = formatDate(date);
					if (!timeWasSelectedByUser) {
						timeField.value = getSuggestedTime(dateField.value);
					}
					renderCalendar();
					updateWhatsAppLink();
				});

				daysContainer.appendChild(button);
			}
		};

		prevMonthButton.addEventListener('click', () => {
			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
			renderCalendar();
		});

		nextMonthButton.addEventListener('click', () => {
			currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
			renderCalendar();
		});

		[nameField, peopleField, timeField, notesField].forEach((field) => {
			field.addEventListener('input', updateWhatsAppLink);
			field.addEventListener('change', updateWhatsAppLink);
		});

		timeField.addEventListener('change', () => {
			timeWasSelectedByUser = true;
		});

		ctaButtons.forEach((ctaButton) => {
			ctaButton.addEventListener('click', (event) => {
				if (ctaButton.classList.contains('is-disabled')) {
					event.preventDefault();
					nameField.focus();
				}
			});
		});

		dateField.value = formatDate(selectedDate);
		timeField.value = getSuggestedTime(dateField.value);
		renderCalendar();
		updateWhatsAppLink();
	}
}
