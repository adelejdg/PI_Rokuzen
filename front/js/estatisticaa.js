// Estatísticas com dados reais do banco de dados
(function () {
    const CHART_NS = '__rokuzenCharts__';
    if (!window[CHART_NS]) window[CHART_NS] = { ontem: null, hoje: null, rend: null };
    const API = 'http://localhost:3000';
    
    function range(n) { 
        return Array.from({ length: n }, (_, i) => i); 
    }

    // Labels por hora: 0h a 23h
    const horas = range(24).map(h => (h < 10 ? '0' + h : '' + h) + 'h');

    // Cores do tema do site
    const colors = {
        primary: '#8BC34A',
        primaryDark: '#689F38',
        primaryLight: '#AED581',
        secondary: '#4CAF50',
        accent: '#2e7d32',
        background: 'rgba(139, 195, 74, 0.1)',
        backgroundDark: 'rgba(46, 125, 50, 0.15)'
    };

    function makeChartOntem(ctx, data) {
        if (window[CHART_NS].ontem) { 
            try { window[CHART_NS].ontem.destroy(); } catch {} 
        }
        
        window[CHART_NS].ontem = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas,
                datasets: [
                    {
                        label: 'Com cadastro',
                        data: data.comCadastro || [],
                        borderColor: colors.primary,
                        backgroundColor: colors.background,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Sem cadastro',
                        data: data.semCadastro || [],
                        borderColor: colors.secondary,
                        backgroundColor: colors.backgroundDark,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.secondary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    title: { 
                        display: true, 
                        text: 'Acessos por hora (ontem)',
                        font: {
                            size: 18,
                            weight: '700'
                        },
                        color: colors.accent,
                        padding: 20
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        borderColor: colors.primary,
                        borderWidth: 2,
                        cornerRadius: 8
                    }
                },
                interaction: { 
                    mode: 'index', 
                    intersect: false 
                },
                scales: {
                    x: { 
                        title: { 
                            display: true, 
                            text: 'Hora do dia',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: colors.accent
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: { 
                        title: { 
                            display: true, 
                            text: 'Número de agendamentos',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: colors.accent
                        },
                        beginAtZero: true,
                        ticks: { 
                            precision: 0,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
        return window[CHART_NS].ontem;
    }

    function makeChartHoje(ctx, data) {
        if (window[CHART_NS].hoje) { 
            try { window[CHART_NS].hoje.destroy(); } catch {} 
        }
        
        window[CHART_NS].hoje = new Chart(ctx, {
            type: 'line',
            data: {
                labels: horas,
                datasets: [
                    {
                        label: 'Com cadastro',
                        data: data.comCadastro || [],
                        borderColor: colors.primary,
                        backgroundColor: colors.background,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.primary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    },
                    {
                        label: 'Sem cadastro',
                        data: data.semCadastro || [],
                        borderColor: colors.secondary,
                        backgroundColor: colors.backgroundDark,
                        borderWidth: 3,
                        tension: 0.4,
                        fill: true,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: colors.secondary,
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    title: { 
                        display: true, 
                        text: 'Acessos por hora (hoje)',
                        font: {
                            size: 18,
                            weight: '700'
                        },
                        color: colors.accent,
                        padding: 20
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        borderColor: colors.primary,
                        borderWidth: 2,
                        cornerRadius: 8
                    }
                },
                interaction: { 
                    mode: 'index', 
                    intersect: false 
                },
                scales: {
                    x: { 
                        title: { 
                            display: true, 
                            text: 'Hora do dia',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: colors.accent
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: { 
                        title: { 
                            display: true, 
                            text: 'Número de agendamentos',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: colors.accent
                        },
                        beginAtZero: true,
                        ticks: { 
                            precision: 0,
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                }
            }
        });
        return window[CHART_NS].hoje;
    }

    function makeChartRendimento(ctx, data) {
        if (window[CHART_NS].rend) { 
            try { window[CHART_NS].rend.destroy(); } catch {} 
        }
        
        const mapMes = { 
            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr', 
            '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago', 
            '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez' 
        };
        
        let meses = [];
        let rendimento = [];
        
        if (Array.isArray(data) && data.length > 0) {
            meses = data.map(x => {
                const mm = String(x._id).slice(5, 7);
                return mapMes[mm] || x._id;
            });
            rendimento = data.map(x => x.receita || 0);
        } else {
            // Fallback para meses padrão se não houver dados
            meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
            rendimento = Array(12).fill(0);
        }
        
        window[CHART_NS].rend = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: meses,
                datasets: [
                    {
                        label: 'Receita (R$)',
                        data: rendimento,
                        backgroundColor: colors.primary,
                        borderColor: colors.primaryDark,
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { 
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 14,
                                weight: '600'
                            }
                        }
                    },
                    title: { 
                        display: true, 
                        text: 'Receita por mês',
                        font: {
                            size: 18,
                            weight: '700'
                        },
                        color: colors.accent,
                        padding: 20
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleFont: {
                            size: 14,
                            weight: '600'
                        },
                        bodyFont: {
                            size: 13
                        },
                        borderColor: colors.primary,
                        borderWidth: 2,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (ctx) {
                                const v = ctx.parsed.y || 0;
                                return `R$ ${v.toFixed(2).replace('.', ',')}`;
                            }
                        }
                    }
                },
                scales: {
                    x: { 
                        title: { 
                            display: true, 
                            text: 'Mês',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: colors.accent
                        },
                        grid: {
                            display: false
                        },
                        ticks: {
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        title: { 
                            display: true, 
                            text: 'Receita (R$)',
                            font: {
                                size: 13,
                                weight: '600'
                            },
                            color: colors.accent
                        },
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value.toFixed(0);
                            },
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
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

        const c1 = document.getElementById('chartOntem');
        const c2 = document.getElementById('chartHoje');
        const c3 = document.getElementById('chartRendimento');

        // Limpar estilos inline
        [c1, c2, c3].forEach(c => { 
            if (c) { 
                c.removeAttribute('height'); 
                c.removeAttribute('width'); 
                c.style.height = ''; 
                c.style.width = ''; 
            } 
        });

        // Carregar dados reais de ontem
        if (c1) {
            fetch(API + '/estatisticas/por-hora-ontem')
                .then(async r => {
                    const data = await r.json().catch(() => ({ comCadastro: [], semCadastro: [] }));
                    makeChartOntem(c1.getContext('2d'), data);
                })
                .catch(() => {
                    makeChartOntem(c1.getContext('2d'), { comCadastro: [], semCadastro: [] });
                });
        }

        // Carregar dados reais de hoje
        if (c2) {
            fetch(API + '/estatisticas/por-hora-hoje')
                .then(async r => {
                    const data = await r.json().catch(() => ({ comCadastro: [], semCadastro: [] }));
                    makeChartHoje(c2.getContext('2d'), data);
                })
                .catch(() => {
                    makeChartHoje(c2.getContext('2d'), { comCadastro: [], semCadastro: [] });
                });
        }

        // Carregar dados reais de rendimento mensal
        if (c3) {
            fetch(API + '/estatisticas/por-mes')
                .then(async r => {
                    const data = await r.json().catch(() => []);
                    makeChartRendimento(c3.getContext('2d'), data);
                })
                .catch(() => {
                    makeChartRendimento(c3.getContext('2d'), []);
                });
        }
    });
})();


