// Dados simulados: ajuste conforme sua necessidade ou integre com backend
(function () {
    // Evita múltiplas instâncias ao navegar sem recarregar
    const CHART_NS = '__rokuzenCharts__';
    if (!window[CHART_NS]) window[CHART_NS] = { ontem: null, hoje: null, rend: null };
    function range(n) { return Array.from({ length: n }, (_, i) => i); }

    // Labels por hora: 0h a 23h
    const horas = range(24).map(h => (h < 10 ? '0' + h : '' + h) + 'h');

    // Acessos com/sem cadastro (ontem e hoje) - exemplo
    const ontemComCadastro = [5, 4, 3, 2, 2, 1, 2, 4, 8, 12, 15, 18, 20, 22, 19, 17, 16, 14, 12, 10, 8, 6, 5, 4];
    const ontemSemCadastro = [8, 7, 6, 5, 4, 3, 3, 6, 10, 14, 18, 22, 24, 26, 22, 20, 18, 16, 14, 12, 10, 8, 7, 6];

    const hojeComCadastro = [3, 3, 2, 2, 1, 1, 2, 3, 6, 10, 13, 16, 18, 21, 20, 18, 17, 15, 13, 11, 9, 7, 6, 5];
    const hojeSemCadastro = [6, 6, 5, 4, 3, 3, 3, 5, 9, 12, 16, 20, 22, 25, 23, 21, 19, 17, 15, 13, 11, 9, 8, 7];

    // Rendimento mensal (R$) - janeiro a dezembro
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const rendimento = [1200, 1450, 1600, 1500, 1700, 1800, 2100, 1950, 2200, 2300, 2400, 2600];

    function makeChartOntem(ctx) {
        if (window[CHART_NS].ontem) { try { window[CHART_NS].ontem.destroy(); } catch {} }
        window[CHART_NS].ontem = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas,
                datasets: [
                    {
                        label: 'Com cadastro',
                        data: ontemComCadastro,
                        borderColor: 'rgba(54, 162, 235, 0.6)', // azul claro
                        backgroundColor: 'rgba(54, 162, 235, 0.15)',
                        tension: 0.25,
                        fill: true
                    },
                    {
                        label: 'Sem cadastro',
                        data: ontemSemCadastro,
                        borderColor: 'rgba(13, 71, 161, 1)', // azul escuro
                        backgroundColor: 'rgba(13, 71, 161, 0.15)',
                        tension: 0.25,
                        fill: true
                    }
                ]
            },
            options: baseLineOptions('Acessos por hora (ontem)')
        });
        return window[CHART_NS].ontem;
    }

    function makeChartHoje(ctx) {
        if (window[CHART_NS].hoje) { try { window[CHART_NS].hoje.destroy(); } catch {} }
        window[CHART_NS].hoje = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas,
                datasets: [
                    {
                        label: 'Com cadastro',
                        data: hojeComCadastro,
                        borderColor: 'rgba(54, 162, 235, 0.6)', // azul claro
                        backgroundColor: 'rgba(54, 162, 235, 0.15)',
                        tension: 0.25,
                        fill: true
                    },
                    {
                        label: 'Sem cadastro',
                        data: hojeSemCadastro,
                        borderColor: 'rgba(13, 71, 161, 1)', // azul escuro
                        backgroundColor: 'rgba(13, 71, 161, 0.15)',
                        tension: 0.25,
                        fill: true
                    }
                ]
            },
            options: baseLineOptions('Acessos por hora (hoje)')
        });
        return window[CHART_NS].hoje;
    }

    function baseLineOptions(title) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: title }
            },
            interaction: { mode: 'index', intersect: false },
            scales: {
                x: { title: { display: true, text: 'Hora' } },
                y: { title: { display: true, text: 'Acessos' }, beginAtZero: true, ticks: { precision: 0 } }
            }
        };
    }

    function makeChartRendimento(ctx) {
        if (window[CHART_NS].rend) { try { window[CHART_NS].rend.destroy(); } catch {} }
        window[CHART_NS].rend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Rendimento (R$)',
                        data: rendimento,
                        backgroundColor: 'rgba(46, 125, 50, 0.6)',
                        borderColor: 'rgba(46, 125, 50, 1)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: 'Rendimento mensal' },
                    tooltip: {
                        callbacks: {
                            label: function (ctx) {
                                const v = ctx.parsed.y || 0;
                                return 'R$ ' + v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                            }
                        }
                    }
                },
                scales: {
                    x: { title: { display: true, text: 'Mês' } },
                    y: {
                        title: { display: true, text: 'R$' },
                        beginAtZero: true,
                        ticks: {
                            callback: function (value) {
                                return 'R$ ' + Number(value).toLocaleString('pt-BR');
                            }
                        }
                    }
                }
            }
        });
        return window[CHART_NS].rend;
    }

    document.addEventListener('DOMContentLoaded', function () {
        if (window.VLibras && typeof window.VLibras.Widget === 'function') {
            try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch {}
        }

        const c1 = /** @type {HTMLCanvasElement} */(document.getElementById('chartOntem'));
        const c2 = /** @type {HTMLCanvasElement} */(document.getElementById('chartHoje'));
        const c3 = /** @type {HTMLCanvasElement} */(document.getElementById('chartRendimento'));

        // Altura controlada via CSS; limpar estilos inline que possam inflar
        [c1, c2, c3].forEach(c => { if (c) { c.removeAttribute('height'); c.removeAttribute('width'); c.style.height = ''; c.style.width = ''; } });

        if (c1) makeChartOntem(c1.getContext('2d'));
        if (c2) makeChartHoje(c2.getContext('2d'));
        if (c3) makeChartRendimento(c3.getContext('2d'));
    });
})();


