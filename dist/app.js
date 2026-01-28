"use strict";
class TravelPlanner {
    constructor() {
        this.form = document.getElementById('travelForm');
        this.submitBtn = document.getElementById('submitBtn');
        this.btnText = this.submitBtn.querySelector('.btn-text');
        this.btnLoader = this.submitBtn.querySelector('.btn-loader');
        this.resultSection = document.getElementById('result');
        this.itineraryDiv = document.getElementById('itinerary');
        this.initializeEventListeners();
        this.initializeDateValidation();
    }
    initializeEventListeners() {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
    initializeDateValidation() {
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        startDateInput.setAttribute('min', today);
        startDateInput.addEventListener('change', (e) => {
            const target = e.target;
            endDateInput.setAttribute('min', target.value);
        });
    }
    async handleSubmit(e) {
        e.preventDefault();
        const formData = this.collectFormData();
        this.setLoadingState(true);
        this.resultSection.style.display = 'none';
        try {
            const response = await fetch('/api/generate-itinerary', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });
            if (!response.ok) {
                throw new Error('生成行程失败');
            }
            const data = await response.json();
            this.displayItinerary(data.itinerary);
            this.scrollToResult();
        }
        catch (error) {
            this.handleError(error);
        }
        finally {
            this.setLoadingState(false);
        }
    }
    collectFormData() {
        return {
            destination: document.getElementById('destination').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            budget: document.getElementById('budget').value,
            preferences: document.getElementById('preferences').value
        };
    }
    setLoadingState(isLoading) {
        this.submitBtn.disabled = isLoading;
        this.btnText.style.display = isLoading ? 'none' : 'inline-block';
        this.btnLoader.style.display = isLoading ? 'inline-block' : 'none';
    }
    displayItinerary(text) {
        this.itineraryDiv.innerHTML = this.formatItinerary(text);
        this.resultSection.style.display = 'block';
    }
    formatItinerary(text) {
        let html = text
            .replace(/### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/## (.*?)$/gm, '<h3>$1</h3>')
            .replace(/# (.*?)$/gm, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/^- (.*?)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
            return '<ul>' + match + '</ul>';
        });
        if (!html.startsWith('<h') && !html.startsWith('<ul>')) {
            html = '<p>' + html + '</p>';
        }
        return html;
    }
    scrollToResult() {
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    handleError(error) {
        const message = error instanceof Error ? error.message : '未知错误';
        alert('抱歉，生成行程时出现错误：' + message);
        console.error('Error:', error);
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new TravelPlanner();
});
//# sourceMappingURL=app.js.map