class StartScreen extends Phaser.Scene {
    constructor() {
        super({
            key: 'StartScreen'
        });
    }
    create() {
        // Title
        this.add.text(800, 300, 'AARAV VS RUHAAN', {
            fontSize: '84px',
            fill: '#fff'
        }).setOrigin(0.5);
        // Class selection text
        this.add.text(800, 400, 'Select Your Class:', {
            fontSize: '32px',
            fill: '#fff'
        }).setOrigin(0.5);
        // Saiyan class button
        const saiyanButton = this.add.text(600, 550, 'Saiyan\n\nHP: 300\nSpeed: 100%\nQ: Energy Beam\nE: Healing', {
                fontSize: '24px',
                fill: '#fff',
                align: 'center'
            }).setOrigin(0.5)
            .setInteractive()
            .setPadding(20)
            .setStyle({
                backgroundColor: '#111'
            });
        // Rogue class button
        const rogueButton = this.add.text(1000, 550, 'Rogue\n\nHP: 400\nSpeed: 85%\nQ: Throwing Axe\nE: Stun Attack\nPassive: 3 HP/s Regen while moving', {
                fontSize: '24px',
                fill: '#fff',
                align: 'center'
            }).setOrigin(0.5)
            .setInteractive()
            .setPadding(20)
            .setStyle({
                backgroundColor: '#111'
            });
        // Highlight selected class
        let selectedClass = null;

        saiyanButton.on('pointerdown', () => {
            saiyanButton.setStyle({
                backgroundColor: '#444'
            });
            rogueButton.setStyle({
                backgroundColor: '#111'
            });
            selectedClass = 'saiyan';
        });
        rogueButton.on('pointerdown', () => {
            rogueButton.setStyle({
                backgroundColor: '#444'
            });
            saiyanButton.setStyle({
                backgroundColor: '#111'
            });
            selectedClass = 'rogue';
        });
        // Start button
        const startButton = this.add.text(800, 700, 'Start Game', {
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0.5)
            .setInteractive()
            .setPadding(10)
            .setStyle({
                backgroundColor: '#111'
            });
        startButton.on('pointerdown', () => {
            this.scene.stop('StartScreen');
            this.scene.start('BossGame', {
                firstStart: true,
                playerClass: selectedClass
            });
        });
    }
}
class BossGame extends Phaser.Scene {
    constructor() {
        super({
            key: 'BossGame'
        });
    }
    init(data) {
        // Initialize game variables
        this.activeAxe = null; // Add this line to track the thrown axe
        this.aarav = null;
        this.jumpCount = 0;
        this.facingRight = true;
        this.isPoisoned = false;
        this.poisonDuration = 0;
        this.hyperChargeAmount = 0;
        this.isHyperCharged = false;
        this.hyperChargeActive = false;
        // Class-specific properties
        this.playerClass = data.playerClass || 'saiyan'; // Will be set to 'saiyan' or 'rogue'
        // Rogue specific properties
        this.isStunning = false;
        this.throwingAxe = null;
        this.axeReturning = false;
        this.stunDuration = 2000; // 2 seconds
        this.canThrowAxe = true;
        // Rogue specific properties
        this.isRogue = true;
        this.defenseBoostActive = false;
        this.defenseBoostDuration = 0;
        this.damageMultiplier = 1;
        this.axeReturnDelay = 1000;
        this.activeAxe = null;
        this.hyperChargeDuration = 5000; // 5 seconds in milliseconds
        this.ruhaan = null;
        this.platforms = null;
        this.bullets = null;
        this.bossBalls = null;
        // Set initial health based on class
        this.aaravHealth = this.playerClass === 'rogue' ? 400 : 300;
        this.maxHealth = this.aaravHealth; // Store max health for UI scaling
        this.ruhhanHealth = 1500; // Buffed boss health
        this.lastShot = 0;
        this.lastBossAttack = 0;
        this.specialAttackCharge = 0; // Counter for special attack
        this.firstStart = true; // Track if it's the first time starting
    }
    preload() {
        // Load background music with correct URL
        this.load.audio('bgMusic', 'https://play.rosebud.ai/assets/Bossfight - Milky Ways.mp3?5Zus');
        // Load axe sprite
        this.load.image('axe', 'https://play.rosebud.ai/assets/GreatAxe.png?K7Gg');
        // Load burrito sprite
        this.load.image('burrito', 'burrit.jpg');
        // Create a temporary platform texture
        this.load.image('arrav', 'arv.gif')
        //arrave sprite
        this.load.image('ruhaan', 'rufat.gif')
        //ruhann sprite
        let graphics = this.add.graphics();
        graphics.fillStyle(0x666666);
        graphics.fillRect(0, 0, 200, 32);
        graphics.generateTexture('platform', 200, 32);
        graphics.destroy();
    }
    create() {
        // Start background music
        this.bgMusic = this.sound.add('bgMusic', {
            loop: true,
            volume: 0.4
        });
        this.bgMusic.play();
        // Set background color and camera bounds
        this.cameras.main.setBackgroundColor('#4488AA');
        this.cameras.main.setBounds(0, 0, 1600, 1000);
        this.add.rectangle(800, 500, 1600, 1000, 0x4488AA); // Add visible background
        this.physics.world.setBounds(0, 0, 1600, 1000);

        // Create static group for platforms
        this.platforms = this.physics.add.staticGroup();

        // Create main platform/ground
        this.platforms.create(800, 980, 'platform')
            .setScale(8, 0.5) // Wider ground platform
            .refreshBody();
        // Create multiple platforms at different heights
        this.platforms.create(300, 800, 'platform')
            .setScale(1.2, 0.3)
            .refreshBody();
        this.platforms.create(800, 700, 'platform')
            .setScale(1.5, 0.3)
            .refreshBody();
        this.platforms.create(1300, 800, 'platform')
            .setScale(1.2, 0.3)
            .refreshBody();
        this.platforms.create(500, 550, 'platform')
            .setScale(1.2, 0.3)
            .refreshBody();
        this.platforms.create(1100, 500, 'platform')
            .setScale(1.2, 0.3)
            .refreshBody();

        // Create Aarav (hero)
        //        this.aarav = this.add.rectangle(100, 450, "50, 80, 0x00ff00");
        this.aarav = this.add.sprite(100, 450, 'arrav');
        this.physics.add.existing(this.aarav);
        this.aarav.body.setBounce(0);
        this.aarav.body.setCollideWorldBounds(true);
        this.aarav.body.setGravityY(600);
        this.aarav.body.setSize(50, 80);
        this.aarav.setScale(0.5);

        // Create Ruhaan (boss)
        //        this.ruhaan = this.add.rectangle(700, 450, 80, 120, 0xff0000);
        this.ruhaan = this.add.sprite(700, 450, 'ruhaan');
        this.physics.add.existing(this.ruhaan);
        this.ruhaan.body.setBounce(0.2);
        this.ruhaan.body.setCollideWorldBounds(true);
        this.ruhaan.body.setGravityY(300);
        this.ruhaan.body.setSize(80, 120);


        // Create groups for projectiles
        this.bullets = this.physics.add.group();
        this.bossBalls = this.physics.add.group();

        // Add colliders
        this.physics.add.collider(this.aarav, this.platforms);
        this.physics.add.collider(this.ruhaan, this.platforms);
        this.physics.add.collider(this.bullets, this.platforms, this.destroyBullet, null, this);
        this.physics.add.collider(this.bossBalls, this.platforms, this.destroyBullet, null, this);

        // Add overlap detection for damage
        this.physics.add.overlap(this.ruhaan, this.bullets, this.hitBoss, null, this);
        this.physics.add.overlap(this.aarav, this.bossBalls, this.hitPlayer, null, this);

        // Create UI container for better organization
        this.uiContainer = this.add.container(0, 0);

        // Aarav's health bar
        const aaravHealthBg = this.add.rectangle(50, 50, 400, 40, 0x000000, 0.7);
        const aaravHealthFrame = this.add.rectangle(50, 50, 400, 40, 0xffffff, 1);
        this.aaravHealthBar = this.add.rectangle(50, 50, 400, 40, 0x00ff00);

        aaravHealthBg.setOrigin(0, 0);
        aaravHealthFrame.setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
        this.aaravHealthBar.setOrigin(0, 0);

        // Add "AARAV" text
        const aaravText = this.add.text(60, 20, 'AARAV', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        });
        // Ruhaan's health bar
        const ruhhanHealthBg = this.add.rectangle(850, 50, 400, 40, 0x000000, 0.7);
        const ruhhanHealthFrame = this.add.rectangle(850, 50, 400, 40, 0xffffff, 1);
        this.ruhhanHealthBar = this.add.rectangle(850, 50, 400, 40, 0xff0000);

        ruhhanHealthBg.setOrigin(0, 0);
        ruhhanHealthFrame.setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
        this.ruhhanHealthBar.setOrigin(0, 0);

        // Add "RUHAAN" text
        const ruhhanText = this.add.text(860, 20, 'RUHAAN', {
            fontSize: '24px',
            fill: '#fff',
            fontStyle: 'bold'
        });
        // Special attack charge bar
        const chargeBg = this.add.rectangle(50, 120, 400, 25, 0x000000, 0.7);
        const chargeFrame = this.add.rectangle(50, 120, 400, 25, 0xffffff, 1);
        this.chargeBarFill = this.add.rectangle(50, 120, 0, 25, 0xffff00);

        chargeBg.setOrigin(0, 0);
        chargeFrame.setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
        this.chargeBarFill.setOrigin(0, 0);

        // Add "SUPER" text
        const superText = this.add.text(60, 100, 'SUPER', {
            fontSize: '20px',
            fill: '#ffff00'
        });
        // Hypercharge bar
        const hyperBg = this.add.rectangle(50, 175, 400, 25, 0x000000, 0.7);
        const hyperFrame = this.add.rectangle(50, 175, 400, 25, 0xffffff, 1);
        this.hyperChargeFill = this.add.rectangle(50, 175, 0, 25, 0x800080);

        hyperBg.setOrigin(0, 0);
        hyperFrame.setOrigin(0, 0).setStrokeStyle(2, 0xffffff);
        this.hyperChargeFill.setOrigin(0, 0);

        // Add "HYPER" text
        const hyperText = this.add.text(60, 155, 'HYPERCHARGE', {
            fontSize: '20px',
            fill: '#800080'
        });

        // Add all UI elements to the container
        this.uiContainer.add([
            aaravHealthBg, aaravHealthFrame, this.aaravHealthBar, aaravText,
            ruhhanHealthBg, ruhhanHealthFrame, this.ruhhanHealthBar, ruhhanText,
            chargeBg, chargeFrame, this.chargeBarFill, superText,
            hyperBg, hyperFrame, this.hyperChargeFill, hyperText
        ]);
        this.hyperChargeFill.setOrigin(0, 0);
        this.cursors = this.input.keyboard.createCursorKeys();
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.qKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
        this.eKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }

    update() {
        // Rogue passive health regeneration - only when moving
        if (this.playerClass === 'rogue' &&
            this.aaravHealth < this.maxHealth &&
            (this.aarav.body.velocity.x !== 0 || this.aarav.body.velocity.y !== 0)) {
            // Regenerate 3 HP per second (adjust for frame rate)
            this.aaravHealth = Math.min(this.maxHealth, this.aaravHealth + (3 / 60));
        }

        // Handle poison damage
        if (this.isPoisoned && this.poisonDuration > 0) {
            this.poisonDuration -= 16; // Approximately one frame at 60fps

            if (this.poisonDuration % 1000 < 16) { // Every second
                this.aaravHealth -= 2; // 2 damage per second from poison

                // Poison effect visualization
                const poisonEffect = this.add.text(
                    this.aarav.x, this.aarav.y - 40,
                    '-2 poison', {
                        fontSize: '16px',
                        fill: '#00ff00'
                    }
                ).setOrigin(0.5);

                this.tweens.add({
                    targets: poisonEffect,
                    y: poisonEffect.y - 30,
                    alpha: 0,
                    duration: 500,
                    onComplete: () => poisonEffect.destroy()
                });
            }

            if (this.poisonDuration <= 0) {
                this.isPoisoned = false;
            }
        }

        // Player movement and jump
        let baseSpeed = this.aarav.body.touching.down ? 300 : 250;
        // Rogue has slightly reduced speed
        if (this.playerClass === 'rogue') {
            baseSpeed *= 0.85; // 85% base speed
        }
        const moveSpeed = this.hyperChargeActive ? baseSpeed * 1.5 : baseSpeed;

        if (this.cursors.left.isDown) {
            this.aarav.body.setVelocityX(-moveSpeed);
            this.facingRight = false;
            this.aarav.setScale(-1, 1); // Flip sprite horizontally
        } else if (this.cursors.right.isDown) {
            this.aarav.body.setVelocityX(moveSpeed);
            this.facingRight = true;
            this.aarav.setScale(1, 1); // Reset sprite orientation
        } else {
            this.aarav.body.setVelocityX(0);
        }
        // Player jump with better ground detection
        // Player jump with better ground detection
        // Reset jump count when touching ground
        if (this.aarav.body.blocked.down) {
            this.jumpCount = 0;
        }
        // Jump mechanics (double jump)
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up) && this.jumpCount < 2) {
            this.aarav.body.setVelocityY(-750);
            this.jumpCount++;

            // Add jump effect
            for (let i = 0; i < 5; i++) {
                const particle = this.add.circle(
                    this.aarav.x + Phaser.Math.Between(-10, 10),
                    this.aarav.y + 40,
                    5,
                    0x88ff88
                );
                this.tweens.add({
                    targets: particle,
                    alpha: 0,
                    y: particle.y + Phaser.Math.Between(20, 40),
                    duration: 200,
                    onComplete: () => particle.destroy()
                });
            }
        }

        // Player shoot
        // Only allow shooting if not performing Q special attack
        if (!this.isPerformingSpecial) {
            const shootDelay = this.hyperChargeActive ? 250 : 500;
            if (this.spaceKey.isDown && this.time.now > this.lastShot + shootDelay) {
                this.shoot();
                this.lastShot = this.time.now;
            }
        }
        // Special Attacks
        if (this.specialAttackCharge >= 10) {
            if (this.qKey.isDown) {
                this.specialAttack();
                this.specialAttackCharge = 0;
            } else if (this.eKey.isDown) {
                this.healingSuper();
                this.specialAttackCharge = 0;
            }
        }
        // Boss AI and attacks
        this.updateBoss();

        // Update health bars and charge bars
        this.aaravHealthBar.width = (this.aaravHealth / this.maxHealth) * 400;
        this.ruhhanHealthBar.width = (this.ruhhanHealth / 1500) * 400;
        this.chargeBarFill.width = (this.specialAttackCharge / 10) * 400;
        this.hyperChargeFill.width = (this.hyperChargeAmount / 10) * 400;
        // Handle hypercharge activation
        if (this.hyperChargeAmount >= 10 && !this.hyperChargeActive && this.input.keyboard.addKey('R').isDown) {
            this.activateHyperCharge();
        }

        // Check for game over
        if (this.aaravHealth <= 0 || this.ruhhanHealth <= 0) {
            this.gameOver();
        }
    }

    shoot() {
        if (this.playerClass === 'saiyan') {
            const bulletSpeed = 400;
            const bulletOffset = this.facingRight ? 25 : -25;
            const bullet = this.add.rectangle(this.aarav.x + bulletOffset, this.aarav.y, 10, 5, 0xffff00);
            this.bullets.add(bullet);
            bullet.body.setVelocityX(this.facingRight ? bulletSpeed : -bulletSpeed);
            bullet.body.setAllowGravity(false);
        } else if (this.playerClass === 'rogue' && !this.activeAxe && this.time.now > this.lastShot + 1200) {
            // Create and throw axe
            const axe = this.physics.add.sprite(this.aarav.x, this.aarav.y, 'axe');
            axe.setScale(0.2);

            // Removed speed boost/reduction text as speed is now constant

            // Speed boost effect
            const boostEffect = this.add.circle(this.aarav.x, this.aarav.y, 20, 0x00ff00, 0.5);
            this.tweens.add({
                targets: boostEffect,
                scale: 2,
                alpha: 0,
                duration: 200,
                onComplete: () => boostEffect.destroy()
            });
            axe.isRogueBasicAttack = true;
            axe.body.setAllowGravity(true);
            axe.body.setBounce(0);
            axe.body.setCollideWorldBounds(true);

            // Add collision with world bounds
            axe.body.onWorldBounds = true;
            this.physics.world.on('worldbounds', (body) => {
                if (body.gameObject === axe) {
                    body.gameObject.setVelocity(0, 0);
                    body.gameObject.body.setAllowGravity(false);
                }
            });

            // Set the axe's velocity based on direction
            const throwSpeed = 600;
            const throwAngle = -0.4; // Slight upward angle
            axe.body.setVelocity(
                this.facingRight ? throwSpeed * Math.cos(throwAngle) : -throwSpeed * Math.cos(throwAngle),
                throwSpeed * Math.sin(throwAngle)
            );

            // Add constant rotation
            this.tweens.add({
                targets: axe,
                rotation: this.facingRight ? 6.28319 : -6.28319,
                duration: 600,
                repeat: -1
            });

            // Store the active axe reference
            this.activeAxe = axe;

            // Add collision with platforms
            this.physics.add.collider(axe, this.platforms, (axe) => {
                axe.setVelocity(0, 0);
                axe.body.setAllowGravity(false);
                // Stop the rotation animation when the axe hits a platform
                this.tweens.killTweensOf(axe);
            });

            // Add collision with boss
            this.physics.add.overlap(axe, this.ruhaan, (axe, boss) => {
                if (axe.active && !axe.hasDealtInitialDamage) {
                    // Initial hit damage
                    const damage = 40;
                    this.ruhhanHealth -= damage;
                    axe.hasDealtInitialDamage = true;

                    // Increase charge on hit
                    this.specialAttackCharge = Math.min(10, this.specialAttackCharge + 2);
                    this.hyperChargeAmount = Math.min(10, this.hyperChargeAmount + 1);

                    // Visual feedback for initial damage
                    const damageText = this.add.text(boss.x, boss.y - 50, `-${damage}!`, {
                        fontSize: '32px',
                        fill: '#ff0000'
                    }).setOrigin(0.5);

                    this.tweens.add({
                        targets: damageText,
                        y: damageText.y - 80,
                        alpha: 0,
                        duration: 800,
                        onComplete: () => damageText.destroy()
                    });

                    // Set up damage over time
                    if (!axe.dotInterval) {
                        axe.lastDotTime = 0;
                        axe.dotInterval = this.time.addEvent({
                            delay: 1000, // 1 second interval
                            callback: () => {
                                if (axe.active && Phaser.Geom.Intersects.RectangleToRectangle(axe.getBounds(), boss.getBounds())) {
                                    // Deal 3 damage per second
                                    this.ruhhanHealth -= 3;

                                    // Visual feedback for DOT
                                    const dotText = this.add.text(boss.x, boss.y - 30, '-3', {
                                        fontSize: '20px',
                                        fill: '#ff6666'
                                    }).setOrigin(0.5);

                                    this.tweens.add({
                                        targets: dotText,
                                        y: dotText.y - 40,
                                        alpha: 0,
                                        duration: 500,
                                        onComplete: () => dotText.destroy()
                                    });
                                }
                            },
                            loop: true
                        });
                    }
                }
            });

            // Add overlap with player for pickup
            this.physics.add.overlap(this.aarav, axe, (player, axe) => {
                // Allow pickup if axe is stationary or moving very slowly
                const velocityThreshold = 10;
                if (Math.abs(axe.body.velocity.x) < velocityThreshold &&
                    Math.abs(axe.body.velocity.y) < velocityThreshold) {
                    // Visual feedback for pickup
                    const pickupEffect = this.add.circle(axe.x, axe.y, 20, 0xffff00, 0.5);
                    this.tweens.add({
                        targets: pickupEffect,
                        scale: 2,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => pickupEffect.destroy()
                    });
                    // Visual feedback for speed reduction
                    const speedEffect = this.add.circle(axe.x, axe.y, 20, 0xff0000, 0.5);
                    this.tweens.add({
                        targets: speedEffect,
                        scale: 2,
                        alpha: 0,
                        duration: 200,
                        onComplete: () => speedEffect.destroy()
                    });

                    // Removed speed change text as speed is now constant

                    axe.destroy();
                    this.activeAxe = null;
                }
            });

            this.lastShot = this.time.now;
        }
    }

    updateBoss() {
        // If boss is stunned, don't perform any actions
        if (this.ruhaan.isStunned) {
            return;
        }

        const distanceToPlayer = Phaser.Math.Distance.Between(
            this.ruhaan.x, this.ruhaan.y,
            this.aarav.x, this.aarav.y
        );
        // Smart movement
        const direction = this.aarav.x - this.ruhaan.x;
        // Strategic movement with platform utilization
        if (this.ruhaan.body.touching.down) {
            if (distanceToPlayer > 500) {
                // Move to closest platform above player
                this.ruhaan.body.setVelocityX(direction < 0 ? -200 : 200);
                if (Math.random() < 0.03) this.ruhaan.body.setVelocityY(-700);
            } else if (distanceToPlayer < 200) {
                // Back away and possibly prepare for ground pound
                this.ruhaan.body.setVelocityX(direction < 0 ? 250 : -250);
                if (this.aarav.y > this.ruhaan.y && Math.random() < 0.1) {
                    this.bossGroundPound();
                }
            } else {
                // Strategic positioning
                this.ruhaan.body.setVelocityX(direction < 0 ? -125 : 125);
            }
        }
        // Occasionally jump to reposition
        if (Math.random() < 0.01 && this.ruhaan.body.touching.down) {
            this.ruhaan.body.setVelocityY(-600);
        }
        // Attack pattern selection
        if (this.time.now > this.lastBossAttack + 2000) {
            const attackChoice = Math.random();

            if (distanceToPlayer < 200) {
                // Close range: prefer jump attack or spin attack
                if (attackChoice < 0.4) {
                    this.bossJumpAttack();
                } else if (attackChoice < 0.8) {
                    this.bossSpinAttack();
                } else {
                    this.bossBallAttack();
                }
            } else if (distanceToPlayer > 600) {
                // Very long range: pull attack or burrito rain
                if (attackChoice < 0.5) {
                    this.bossPullAttack();
                } else {
                    this.bossBurritoRain();
                }
            } else {
                // Medium range: prefer ball attack or multi-ball
                if (attackChoice < 0.4) {
                    this.bossBallAttack();
                } else if (attackChoice < 0.8) {
                    this.bossMultiBallAttack();
                } else {
                    this.bossJumpAttack();
                }
            }
            this.lastBossAttack = this.time.now;
        }
    }

    bossBallAttack() {
        const ball = this.add.circle(this.ruhaan.x, this.ruhaan.y, 15, 0xff6600);
        this.bossBalls.add(ball);
        ball.body.setAllowGravity(false);
        const angle = Phaser.Math.Angle.Between(
            this.ruhaan.x, this.ruhaan.y,
            this.aarav.x, this.aarav.y
        );
        this.physics.moveTo(ball, this.aarav.x, this.aarav.y, 300);
    }

    bossJumpAttack() {
        if (this.ruhaan.body.touching.down) {
            this.ruhaan.body.setVelocityY(-500);
        }
    }
    bossSpinAttack() {
        // Create a circle of projectiles around the boss
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI * 2) / 8;
            const ball = this.add.circle(this.ruhaan.x, this.ruhaan.y, 10, 0xff6600);
            this.bossBalls.add(ball);
            ball.body.setVelocity(
                Math.cos(angle) * 300,
                Math.sin(angle) * 300
            );
            ball.body.setAllowGravity(false);
        }
    }
    bossMultiBallAttack() {
        // Fire three balls in a spread pattern
        for (let i = -1; i <= 1; i++) {
            const ball = this.add.circle(this.ruhaan.x, this.ruhaan.y, 15, 0xff6600);
            this.bossBalls.add(ball);
            const angle = Phaser.Math.Angle.Between(
                this.ruhaan.x, this.ruhaan.y,
                this.aarav.x, this.aarav.y
            ) + (i * Math.PI / 8);
            ball.body.setVelocity(
                Math.cos(angle) * 300,
                Math.sin(angle) * 300
            );
            ball.body.setAllowGravity(false);
        }
    }
    bossGroundPound() {
        // Initial jump for ground pound
        this.ruhaan.body.setVelocityY(-800);

        // After reaching apex, slam down
        this.time.delayedCall(700, () => {
            this.ruhaan.body.setVelocityY(1200);

            // When hitting ground, create shockwave
            this.physics.add.collider(this.ruhaan, this.platforms, () => {
                if (this.ruhaan.body.velocity.y > 0) {
                    // Create shockwave effect
                    for (let i = -2; i <= 2; i++) {
                        const shockwave = this.add.circle(
                            this.ruhaan.x + (i * 100),
                            this.ruhaan.y + 40,
                            20,
                            0xff0000
                        );
                        this.bossBalls.add(shockwave);
                        shockwave.body.setVelocityY(-300);
                        shockwave.body.setVelocityX(i * 200);
                        shockwave.body.setAllowGravity(false);

                        // Fade out and destroy
                        this.tweens.add({
                            targets: shockwave,
                            alpha: 0,
                            duration: 1000,
                            onComplete: () => shockwave.destroy()
                        });
                    }
                }
            }, null, this);
        });
    }
    bossPullAttack() {
        // Visual effect for the pull
        const pullEffect = this.add.rectangle(this.aarav.x, this.aarav.y, 50, 10, 0xff0000);

        // Calculate pull direction
        const angle = Phaser.Math.Angle.Between(
            this.aarav.x, this.aarav.y,
            this.ruhaan.x, this.ruhaan.y
        );

        // Apply pull force to player
        const pullForce = 400;
        this.aarav.body.setVelocityX(Math.cos(angle) * pullForce);

        // Visual feedback
        this.tweens.add({
            targets: pullEffect,
            scaleX: 3,
            alpha: 0,
            duration: 500,
            onComplete: () => pullEffect.destroy()
        });
    }

    bossBurritoRain() {
        // Create 5 burritos that fall from above
        for (let i = 0; i < 5; i++) {
            const x = this.aarav.x + Phaser.Math.Between(-400, 400);
            const burrito = this.physics.add.sprite(x, 0, 'burrito');
            burrito.setScale(0.1); // Adjust scale to make it an appropriate size
            // Set the hitbox to match the scaled sprite size
            burrito.body.setSize(burrito.width * 0.8, burrito.height * 0.8);
            burrito.body.setOffset(burrito.width * 0.1, burrito.height * 0.1);
            this.bossBalls.add(burrito);
            burrito.isBurrito = true;

            // Add falling physics
            burrito.body.setVelocityY(300);
            burrito.body.setVelocityX(Phaser.Math.Between(-50, 50));
            burrito.body.setAllowGravity(true);

            // Destroy after 3 seconds if not hit
            this.time.delayedCall(3000, () => {
                if (burrito.active) {
                    burrito.destroy();
                }
            });
        }
    }
    hitBoss(ruhaan, bullet) {
        bullet.destroy();
        let damage = 0;

        // Create damage counter text
        const damageText = this.add.text(ruhaan.x, ruhaan.y - 50, '', {
            fontSize: '28px',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        if (bullet.isSpecialBeam) {
            damage = this.playerClass === 'rogue' ? 75 : 50;
        } else if (bullet.isRogueBasicAttack) {
            damage = 40;
            // Add charging for basic attacks
            this.specialAttackCharge = Math.min(10, this.specialAttackCharge + 2);
            this.hyperChargeAmount = Math.min(10, this.hyperChargeAmount + 1);
        } else {
            damage = this.playerClass === 'rogue' ? 40 : 10;
        }

        if (this.hyperChargeActive) {
            damage *= 1.5;
        }

        this.ruhhanHealth -= damage;

        // Set damage text color based on attack type
        let textColor = '#ff0000';
        if (bullet.isSpecialBeam) {
            textColor = this.hyperChargeActive ? '#800080' : '#00ffff';
        } else if (bullet.isRogueBasicAttack) {
            textColor = '#ffa500';
        }

        damageText.setStyle({
            fill: textColor
        });
        damageText.setText(`-${Math.round(damage)}`);

        // Animate the damage text
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 80,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => damageText.destroy()
        });

        // Rogue charges faster
        if (this.playerClass === 'rogue') {
            if (bullet.isRogueBasicAttack) {
                this.specialAttackCharge = Math.min(10, this.specialAttackCharge + 1.5); // Basic attack charge
                this.hyperChargeAmount = Math.min(10, this.hyperChargeAmount + 0.5); // Basic attack hypercharge
            } else {
                this.specialAttackCharge = Math.min(10, this.specialAttackCharge + 2.5); // Special attack charge
                this.hyperChargeAmount = Math.min(10, this.hyperChargeAmount + 0.75); // Special attack hypercharge
            }
        } else {
            this.specialAttackCharge = Math.min(10, this.specialAttackCharge + 0.8);
            this.hyperChargeAmount = Math.min(10, this.hyperChargeAmount + 0.25);
        }
        if (this.ruhhanHealth <= 0) {
            this.gameOver();
        }
    }

    hitPlayer(aarav, projectile) {
        let damage = this.hyperChargeActive ? 12 : 18; // Increased base damage

        // Create damage counter text
        const damageText = this.add.text(aarav.x, aarav.y - 50, '', {
            fontSize: '28px',
            fontStyle: 'bold',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);

        // Reduce damage when defense boost is active
        if (this.defenseBoostActive) {
            damage = Math.floor(damage * 0.6); // 40% damage reduction
        }

        if (projectile.isBurrito) {
            damage = 7; // Increased burrito damage
            this.isPoisoned = true;
            this.poisonDuration = 5000; // 5 seconds of poison
        }

        this.aaravHealth -= damage;

        // Set damage text color and content based on attack type
        let textColor = '#ff0000';
        let displayDamage = Math.round(damage);

        if (projectile.isBurrito) {
            textColor = '#00ff00'; // Green for poison damage
        }

        damageText.setStyle({
            fill: textColor
        });
        damageText.setText(`-${displayDamage}`);

        // Animate the damage text
        this.tweens.add({
            targets: damageText,
            y: damageText.y - 80,
            alpha: 0,
            duration: 800,
            ease: 'Power1',
            onComplete: () => damageText.destroy()
        });

        projectile.destroy();

        if (this.aaravHealth <= 0) {
            this.gameOver();
        }
    }

    destroyBullet(bullet) {
        bullet.destroy();
    }
    specialAttack() {
        if (this.playerClass === 'rogue') {
            // Initialize properties for rogue's super axe
            this.isPerformingSpecial = true;

            // Create and throw enhanced axe
            const axe = this.physics.add.sprite(this.aarav.x, this.aarav.y, 'axe');
            axe.setScale(0.4);
            axe.body.setAllowGravity(false);
            axe.isSpecialBeam = true;
            // Enhanced throw speed and direction
            const throwSpeed = 1000;
            const direction = this.facingRight ? 1 : -1;
            axe.body.setVelocityX(throwSpeed * direction);
            // Spinning animation
            this.tweens.add({
                targets: axe,
                rotation: direction * 12.56638,
                duration: 1000,
                repeat: -1
            });
            // Return axe after delay
            this.time.delayedCall(1000, () => {
                if (axe.active) {
                    const returnInterval = this.time.addEvent({
                        delay: 16,
                        callback: () => {
                            if (axe.active) {
                                const dx = this.aarav.x - axe.x;
                                const dy = this.aarav.y - axe.y;
                                const angle = Math.atan2(dy, dx);
                                const returnSpeed = 1200;

                                axe.body.setVelocity(
                                    Math.cos(angle) * returnSpeed,
                                    Math.sin(angle) * returnSpeed
                                );
                                if (Phaser.Math.Distance.Between(axe.x, axe.y, this.aarav.x, this.aarav.y) < 50) {
                                    returnInterval.destroy();
                                    axe.destroy();
                                    this.isPerformingSpecial = false;
                                }
                            }
                        },
                        loop: true
                    });
                    // Safety cleanup
                    this.time.delayedCall(2000, () => {
                        if (axe.active) {
                            returnInterval.destroy();
                            axe.destroy();
                            this.isPerformingSpecial = false;
                        }
                    });
                }
            });
        } else {
            // Initialize beam properties for saiyan
            const beamWidth = 40;
            const beamLength = 800;
            const chargeTime = 500;
            this.isPerformingSpecial = true;

            // Create charging effect
            const chargeCircle = this.add.circle(this.aarav.x, this.aarav.y, 30, this.hyperChargeActive ? 0x800080 : 0x00ffff, 0.5);
            this.tweens.add({
                targets: chargeCircle,
                scale: 2,
                alpha: 0.8,
                duration: chargeTime,
                yoyo: true,
                repeat: 0,
                onComplete: () => chargeCircle.destroy()
            });
            // After charge time, fire the beam
            this.time.delayedCall(chargeTime, () => {
                // Create main beam
                const beam = this.add.rectangle(this.aarav.x, this.aarav.y, beamLength, beamWidth, this.hyperChargeActive ? 0x800080 : 0x00ffff);
                this.bullets.add(beam);
                beam.isSpecialBeam = true;
                beam.body.setAllowGravity(false);

                // Set beam direction based on player facing
                const direction = this.facingRight ? 1 : -1;
                beam.body.setVelocityX(1000 * direction);
                // Add beam particles
                for (let i = 0; i < 20; i++) {
                    const particle = this.add.circle(
                        this.aarav.x + (direction * Phaser.Math.Between(0, beamLength / 2)),
                        this.aarav.y + Phaser.Math.Between(-beamWidth / 2, beamWidth / 2),
                        Phaser.Math.Between(5, 10),
                        this.hyperChargeActive ? 0x800080 : 0x00ffff
                    );
                    this.tweens.add({
                        targets: particle,
                        x: particle.x + (direction * Phaser.Math.Between(100, 200)),
                        alpha: 0,
                        scale: 0.5,
                        duration: 500,
                        onComplete: () => particle.destroy()
                    });
                }
                // Destroy beam after 1 second
                this.time.delayedCall(1000, () => {
                    if (beam.active) {
                        beam.destroy();
                    }
                    this.isPerformingSpecial = false;
                });
            });
        }
    }
    throwAxe() {
        if (!this.isPerformingSpecial && !this.activeAxe) {
            this.isPerformingSpecial = true;

            // Create and throw axe
            const axe = this.physics.add.sprite(this.aarav.x, this.aarav.y, 'axe');
            axe.setScale(0.3);
            axe.body.setAllowGravity(false);
            axe.isSpecialBeam = true;

            // Set initial throw direction and speed
            const throwSpeed = 800;
            const direction = this.facingRight ? 1 : -1;
            axe.body.setVelocityX(throwSpeed * direction);

            // Constant rotation
            this.tweens.add({
                targets: axe,
                rotation: direction * 6.28319,
                duration: 1000,
                repeat: -1
            });

            // Return axe after 1 second
            this.time.delayedCall(1000, () => {
                // Track axe return
                const returnInterval = this.time.addEvent({
                    delay: 16,
                    callback: () => {
                        if (axe.active) {
                            // Calculate angle to player's current position
                            const dx = this.aarav.x - axe.x;
                            const dy = this.aarav.y - axe.y;
                            const angle = Math.atan2(dy, dx);

                            // Update axe velocity to follow player
                            const returnSpeed = 1000;
                            axe.body.setVelocity(
                                Math.cos(angle) * returnSpeed,
                                Math.sin(angle) * returnSpeed
                            );

                            // Check if axe has returned
                            if (Phaser.Math.Distance.Between(axe.x, axe.y, this.aarav.x, this.aarav.y) < 50) {
                                returnInterval.destroy();
                                axe.destroy();
                                this.isPerformingSpecial = false;
                            }
                        }
                    },
                    loop: true
                });

                // Safety cleanup after 2 seconds if axe hasn't returned
                this.time.delayedCall(2000, () => {
                    if (axe.active) {
                        returnInterval.destroy();
                        axe.destroy();
                        this.isPerformingSpecial = false;
                    }
                });
            });
        }

        // Create charging effect
        const chargeCircle = this.add.circle(this.aarav.x, this.aarav.y, 30, this.hyperChargeActive ? 0x800080 : 0x00ffff, 0.5);
        this.tweens.add({
            targets: chargeCircle,
            scale: 2,
            alpha: 0.8,
            duration: chargeTime,
            yoyo: true,
            repeat: 0,
            onComplete: () => chargeCircle.destroy()
        });
        // After charge time, fire the beam
        this.time.delayedCall(chargeTime, () => {

            // Create main beam
            const beam = this.add.rectangle(this.aarav.x, this.aarav.y, beamLength, beamWidth, this.hyperChargeActive ? 0x800080 : 0x00ffff);
            this.bullets.add(beam);
            beam.isSpecialBeam = true; // Mark this as a special beam
            beam.body.setAllowGravity(false);
            beam.body.setVelocityX(1000);
            // Add particle effects
            for (let i = 0; i < 20; i++) {
                const particle = this.add.circle(
                    this.aarav.x + Phaser.Math.Between(0, beamLength / 2),
                    this.aarav.y + Phaser.Math.Between(-beamWidth / 2, beamWidth / 2),
                    Phaser.Math.Between(5, 10),
                    this.hyperChargeActive ? 0x800080 : 0x00ffff
                );

                this.tweens.add({
                    targets: particle,
                    x: particle.x + Phaser.Math.Between(100, 200),
                    alpha: 0,
                    scale: 0.5,
                    duration: 500,
                    onComplete: () => particle.destroy()
                });
            }
            // Add energy gathering effect before beam
            for (let i = 0; i < 10; i++) {
                const chargeParticle = this.add.circle(
                    this.aarav.x + Phaser.Math.Between(-50, 50),
                    this.aarav.y + Phaser.Math.Between(-50, 50),
                    8,
                    this.hyperChargeActive ? 0x800080 : 0x00ffff
                );

                this.tweens.add({
                    targets: chargeParticle,
                    x: this.aarav.x,
                    y: this.aarav.y,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => chargeParticle.destroy()
                });
            }

            // Special attack does more damage
            this.physics.add.overlap(this.ruhaan, beam, (ruhaan, beam) => {
                beam.destroy();
                const damage = this.hyperChargeActive ? 150 : 100; // 50% more damage when hypercharged
                this.ruhhanHealth -= damage;
                // Visual feedback for big damage
                const damageText = this.add.text(this.ruhaan.x, this.ruhaan.y - 50, `-${damage}!`, {
                    fontSize: '32px',
                    fill: '#ff0000'
                }).setOrigin(0.5);

                this.tweens.add({
                    targets: damageText,
                    y: damageText.y - 80,
                    alpha: 0,
                    duration: 800,
                    onComplete: () => damageText.destroy()
                });

                if (this.ruhhanHealth <= 0) {
                    this.gameOver();
                }
            }, null, this);
            // Destroy beam after 1 second
            this.time.delayedCall(1000, () => {
                if (beam.active) {
                    beam.destroy();
                }
                this.isPerformingSpecial = false;
            });
        });
    }
    healingSuper() {
        if (this.playerClass === 'rogue') {
            // Rogue's stun attack
            this.stunAttack();
        } else {
            // Saiyan's healing
            const healAmount = this.hyperChargeActive ? 100 : 50;
            this.aaravHealth = Math.min(this.maxHealth, this.aaravHealth + healAmount);
            this.healing();
        }
    }
    stunAttack() {
        if (!this.ruhaan.isStunned) {
            // Set stun flag
            this.ruhaan.isStunned = true;

            // Stop all current boss movements and attacks
            this.ruhaan.body.setVelocity(0, 0);
            this.ruhaan.body.moves = false;

            // Visual effects for stun
            this.ruhaan.setTint(0xFFFF00);

            // Create stun stars effect
            const createStunStar = () => {
                if (this.ruhaan.isStunned) {
                    const star = this.add.text(
                        this.ruhaan.x + Phaser.Math.Between(-30, 30),
                        this.ruhaan.y + Phaser.Math.Between(-50, -20),
                        '⭐', {
                            fontSize: '24px'
                        }
                    ).setOrigin(0.5);
                    this.tweens.add({
                        targets: star,
                        y: star.y - 30,
                        alpha: 0,
                        duration: 1000,
                        onComplete: () => star.destroy()
                    });
                }
            };
            // Create stun effect text
            const stunEffect = this.add.text(
                this.ruhaan.x,
                this.ruhaan.y - 50,
                '⚡STUNNED!⚡', {
                    fontSize: '24px',
                    fill: '#ffff00',
                    stroke: '#000000',
                    strokeThickness: 4
                }
            ).setOrigin(0.5);
            // Update stun effect position
            const updateStunText = () => {
                if (stunEffect.active) {
                    stunEffect.setPosition(this.ruhaan.x, this.ruhaan.y - 50);
                }
            };
            this.events.on('update', updateStunText);
            // Create periodic stun stars
            const starTimer = this.time.addEvent({
                delay: 300,
                callback: createStunStar,
                repeat: this.stunDuration / 300 - 1
            });
            // Remove stun after duration
            this.time.delayedCall(this.stunDuration, () => {
                this.ruhaan.isStunned = false;
                this.ruhaan.clearTint();
                this.ruhaan.body.moves = true;
                stunEffect.destroy();
                this.events.off('update', updateStunText);
                starTimer.remove();
            });
        }
    }
    healing() {
        // Activate defense and damage boost
        this.defenseBoostActive = true;
        this.damageMultiplier = 1.5; // 50% damage boost
        // Create healing circle effect
        const healEffect = this.add.circle(this.aarav.x, this.aarav.y, 50, 0x00ff00, 0.3);
        this.tweens.add({
            targets: healEffect,
            scale: 2,
            alpha: 0,
            duration: 500,
            onComplete: () => healEffect.destroy()
        });
        // Create healing buff icon (green heart)
        const buffIcon = this.add.text(this.aarav.x, this.aarav.y - 60, '💚', {
            fontSize: '32px'
        }).setOrigin(0.5);
        // Update buff icon position with player
        const updateIconPosition = () => {
            if (buffIcon && buffIcon.active) {
                buffIcon.setPosition(this.aarav.x, this.aarav.y - 60);
            }
        };
        this.events.on('update', updateIconPosition);
        // Duration of the healing buff
        const healDuration = this.hyperChargeActive ? 8000 : 5000; // 8 or 5 seconds
        // Remove buff after duration
        this.time.delayedCall(healDuration, () => {
            this.defenseBoostActive = false;
            this.damageMultiplier = 1;
            if (buffIcon && buffIcon.active) {
                buffIcon.destroy();
            }
            this.events.off('update', updateIconPosition);
        });
        // Create healing animation with numbers
        const healAmount = this.hyperChargeActive ? '+100' : '+50';
        const healText = this.add.text(this.aarav.x, this.aarav.y - 40, healAmount, {
            fontSize: '32px',
            fill: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({
            targets: healText,
            y: healText.y - 80,
            alpha: 0,
            duration: 1000,
            ease: 'Power1',
            onComplete: () => healText.destroy()
        });
        // Create healing particles
        for (let i = 0; i < 8; i++) {
            const particle = this.add.circle(
                this.aarav.x + Phaser.Math.Between(-30, 30),
                this.aarav.y + Phaser.Math.Between(-30, 30),
                5,
                0x00ff00
            );
            this.tweens.add({
                targets: particle,
                y: particle.y - Phaser.Math.Between(60, 100),
                alpha: 0,
                scale: 0.5,
                duration: 800,
                ease: 'Power1',
                onComplete: () => particle.destroy()
            });
        }
    }
    activateHyperCharge() {
        this.hyperChargeActive = true;
        this.hyperChargeAmount = 0;
        this.hyperChargeFill.width = 0;
        // Visual effect for activation
        const flash = this.add.rectangle(0, 0, 1600, 1000, 0x800080, 0.3);
        this.tweens.add({
            targets: flash,
            alpha: 0,
            duration: 500,
            onComplete: () => flash.destroy()
        });
        // Create continuous purple smoke effect
        const smokeEmitter = this.time.addEvent({
            delay: 100,
            callback: () => {
                if (this.hyperChargeActive) {
                    for (let i = 0; i < 2; i++) {
                        const smoke = this.add.circle(
                            this.aarav.x + Phaser.Math.Between(-20, 20),
                            this.aarav.y + Phaser.Math.Between(-20, 20),
                            Phaser.Math.Between(5, 10),
                            0x800080,
                            0.6
                        );
                        this.tweens.add({
                            targets: smoke,
                            alpha: 0,
                            scale: 2,
                            y: smoke.y - Phaser.Math.Between(50, 100),
                            duration: 1000,
                            onComplete: () => smoke.destroy()
                        });
                    }
                }
            },
            repeat: 39 // 4 seconds worth of smoke (40 * 100ms)
        });
        // Purple aura around player
        const aura = this.add.circle(this.aarav.x, this.aarav.y, 40, 0x800080, 0.3);
        this.tweens.add({
            targets: aura,
            alpha: 0.6,
            scale: 1.2,
            duration: 500,
            yoyo: true,
            repeat: 9,
            onComplete: () => aura.destroy()
        });
        // Deactivate after 4 seconds
        this.time.delayedCall(4000, () => {
            this.hyperChargeActive = false;
        });
    }
    showControls() {
        const controls = [
            'Controls:',
            'Arrow Keys: Move and Jump (Double Jump available)',
            'SPACE: Shoot',
            'Q: Special Attack (when charged)',
            'E: Healing (when charged)',
            'R: Activate Hypercharge (when purple bar is full)'
        ];
        const controlsBox = this.add.container(600, 200);
        // Add semi-transparent background
        const bg = this.add.rectangle(0, 0, 500, 200, 0x000000, 0.7);
        controlsBox.add(bg);
        // Add control text
        controls.forEach((text, i) => {
            const controlText = this.add.text(0, -80 + (i * 30), text, {
                fontSize: '20px',
                fill: '#fff'
            }).setOrigin(0.5);
            controlsBox.add(controlText);
        });
        // Fade out after 7 seconds
        this.tweens.add({
            targets: controlsBox,
            alpha: 0,
            duration: 1000,
            delay: 7000,
            onComplete: () => controlsBox.destroy()
        });
    }
    gameOver() {
        // Disable all physics and input
        this.physics.pause();
        this.input.keyboard.enabled = false;

        // Stop the background music
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
        const winner = this.aaravHealth <= 0 ? 'Ruhaan' : 'Aarav';

        // Create semi-transparent background
        const bg = this.add.rectangle(800, 500, 1600, 1000, 0x000000, 0.7);

        // Game over text
        this.add.text(800, 400, `Game Over! ${winner} wins!`, {
            fontSize: '64px',
            fill: '#fff'
        }).setOrigin(0.5);

        // Restart button
        const restartButton = this.add.text(800, 500, 'Play Again', {
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0.5)
            .setInteractive()
            .setPadding(10)
            .setStyle({
                backgroundColor: '#111'
            });

        // Main menu button
        const menuButton = this.add.text(800, 570, 'Main Menu', {
                fontSize: '32px',
                fill: '#fff'
            }).setOrigin(0.5)
            .setInteractive()
            .setPadding(10)
            .setStyle({
                backgroundColor: '#111'
            });
        restartButton.on('pointerdown', () => {
            // Reset all game variables
            this.aaravHealth = 150;
            this.ruhhanHealth = 1000;
            this.specialAttackCharge = 0;
            this.hyperChargeAmount = 0;
            this.hyperChargeActive = false;

            // Re-enable input
            this.input.keyboard.enabled = true;

            // Restart the scene properly
            this.scene.restart();
        });
        menuButton.on('pointerdown', () => {
            // Stop the music
            if (this.bgMusic) {
                this.bgMusic.stop();
            }
            // Clean up current scene
            this.scene.stop('BossGame');
            // Start the start screen
            this.scene.start('StartScreen');
        });
    }
}

// Game configuration
const config = {
    type: Phaser.AUTO,
    width: 1600,
    height: 1000,
    backgroundColor: '#4488AA',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 1000
            },
            debug: false
        }
    },
    scene: [StartScreen, BossGame]
};

// Create the game instance
const game = new Phaser.Game(config);
