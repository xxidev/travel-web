interface TravelFormData {
    destination: string;
    startDate: string;
    endDate: string;
    budget: string;
    preferences: string;
}

interface ItineraryResponse {
    itinerary: string;
}

interface ErrorResponse {
    error: string;
    details?: string;
}

class TravelPlanner {
    private form: HTMLFormElement;
    private submitBtn: HTMLButtonElement;
    private btnText: HTMLElement;
    private btnLoader: HTMLElement;
    private resultSection: HTMLElement;
    private itineraryDiv: HTMLElement;

    constructor() {
        this.form = document.getElementById('travelForm') as HTMLFormElement;
        this.submitBtn = document.getElementById('submitBtn') as HTMLButtonElement;
        this.btnText = this.submitBtn.querySelector('.btn-text') as HTMLElement;
        this.btnLoader = this.submitBtn.querySelector('.btn-loader') as HTMLElement;
        this.resultSection = document.getElementById('result') as HTMLElement;
        this.itineraryDiv = document.getElementById('itinerary') as HTMLElement;

        this.initializeEventListeners();
        this.initializeDateValidation();
    }

    private initializeEventListeners(): void {
        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    private initializeDateValidation(): void {
        const today = new Date().toISOString().split('T')[0];
        const startDateInput = document.getElementById('startDate') as HTMLInputElement;
        const endDateInput = document.getElementById('endDate') as HTMLInputElement;

        startDateInput.setAttribute('min', today);

        startDateInput.addEventListener('change', (e) => {
            const target = e.target as HTMLInputElement;
            endDateInput.setAttribute('min', target.value);
        });
    }

    private async handleSubmit(e: Event): Promise<void> {
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

            const data: ItineraryResponse = await response.json();

            this.displayItinerary(data.itinerary);
            this.scrollToResult();

        } catch (error) {
            this.handleError(error);
        } finally {
            this.setLoadingState(false);
        }
    }

    private collectFormData(): TravelFormData {
        return {
            destination: (document.getElementById('destination') as HTMLInputElement).value,
            startDate: (document.getElementById('startDate') as HTMLInputElement).value,
            endDate: (document.getElementById('endDate') as HTMLInputElement).value,
            budget: (document.getElementById('budget') as HTMLInputElement).value,
            preferences: (document.getElementById('preferences') as HTMLTextAreaElement).value
        };
    }

    private setLoadingState(isLoading: boolean): void {
        this.submitBtn.disabled = isLoading;
        this.btnText.style.display = isLoading ? 'none' : 'inline-block';
        this.btnLoader.style.display = isLoading ? 'inline-block' : 'none';
    }

    private displayItinerary(text: string): void {
        this.itineraryDiv.innerHTML = this.formatItinerary(text);
        this.resultSection.style.display = 'block';
    }

    private formatItinerary(text: string): string {
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

    private scrollToResult(): void {
        this.resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    private handleError(error: unknown): void {
        const message = error instanceof Error ? error.message : '未知错误';
        alert('抱歉，生成行程时出现错误：' + message);
        console.error('Error:', error);
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    new TravelPlanner();
});
