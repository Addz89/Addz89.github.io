import sys
import json
from random import randint, choice
import pygame
from itertools import cycle

def load_image(path):
    try:
        image = pygame.image.load(path).convert_alpha()
        return image
    except pygame.error as e:
        print(f"Error loading image at {path}: {e}")
        sys.exit()

class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.player_walk = [load_image('Mygame/Player/player_walk_1.png'),
                            load_image('Mygame/Player/player_walk_2.png')]
        self.player_index = 0
        self.player_jump = load_image('Mygame/Player/Jump.png')
        self.image = self.player_walk[self.player_index]
        self.rect = self.image.get_rect(midbottom=(80, 300))
        self.gravity = 0
        self.jump_sound = pygame.mixer.Sound('Mygame/Sounds/jump.mp3')
        self.jump_sound.set_volume(0.2)

    def player_input(self):
        keys = pygame.key.get_pressed()
        mouse_clicked = pygame.mouse.get_pressed()[0]

        if (keys[pygame.K_SPACE] or mouse_clicked) and self.rect.bottom >= 300:
            self.gravity = -20
            self.jump_sound.play()

    def apply_gravity(self):
        self.gravity += 1
        self.rect.y += self.gravity
        if self.rect.bottom >= 300:
            self.rect.bottom = 300

    def animation_state(self):
        if self.rect.bottom < 300:
            self.image = self.player_jump
        else:
            self.player_index += 0.1
            if self.player_index >= len(self.player_walk):
                self.player_index = 0
            self.image = self.player_walk[int(self.player_index)]

    def update(self):
        self.player_input()
        self.apply_gravity()
        self.animation_state()

class Obstacle(pygame.sprite.Sprite):
    def __init__(self, obstacle_type):
        super().__init__()

        if obstacle_type == 'fly':
            frames = ['Mygame/Fly/Fly1.png', 'Mygame/Fly/Fly2.png']
            y_pos = 180
        else:
            frames = ['Mygame/snail/snail1.png', 'Mygame/snail/snail2.png']
            y_pos = 300

        self.frames = [load_image(frame) for frame in frames]
        self.animation_index = 0
        self.image = self.frames[int(self.animation_index)]
        self.rect = self.image.get_rect(midbottom=(randint(900, 1100), y_pos))

    def animation_state(self):
        self.animation_index += 0.1
        if self.animation_index >= len(self.frames):
            self.animation_index = 0
        self.image = self.frames[int(self.animation_index)]

    def update(self):
        self.animation_state()
        self.rect.x -= 6
        self.destroy()

    def destroy(self):
        if self.rect.x <= -100:
            self.kill()

def display_score(start_time):
    current_time = int(pygame.time.get_ticks() / 1000) - start_time
    score_surf = test_font.render(f'Score: {current_time}', False, (64, 64, 64))
    score_rect = score_surf.get_rect(center=(400, 50))
    screen.blit(score_surf, score_rect)
    return current_time

def obstacle_movement(obstacle_list):
    for obstacle in obstacle_list:
        obstacle.update()
        if obstacle.rect.bottom == 300:
            screen.blit(obstacle.frames[int(obstacle.animation_index)], obstacle.rect)
        else:
            screen.blit(obstacle.frames[int(obstacle.animation_index)], obstacle.rect)

    obstacle_list = [obstacle for obstacle in obstacle_list if obstacle.rect.x > -100]
    return obstacle_list

def collisions(player, obstacles):
    return not any(player.colliderect(obstacle.rect) for obstacle in obstacles)

def high_score_screen(screen, score):
    screen.fill((128, 158, 128))  # Set the background color
    high_score_font = pygame.font.Font(None, 36)
    
    # Display the final score
    score_message = high_score_font.render(f'Your Final Score: {score}', True, (0, 0, 0))
    score_rect = score_message.get_rect(center=(400, 150))
    screen.blit(score_message, score_rect)

    # Display options to play again or exit
    play_again_text = high_score_font.render('Play Again', True, (0, 0, 0))
    play_again_rect = play_again_text.get_rect(center=(300, 250))
    screen.blit(play_again_text, play_again_rect)

    exit_text = high_score_font.render('Exit', True, (0, 0, 0))
    exit_rect = exit_text.get_rect(center=(500, 250))
    screen.blit(exit_text, exit_rect)

    pygame.display.update()

    # Wait for player input
    while True:
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                if play_again_rect.collidepoint(mouse_pos):
                    # Save the score to the high_score.json file
                    save_high_score(score)
                    return True  # Restart the game
                elif exit_rect.collidepoint(mouse_pos):
                    pygame.quit()
                    sys.exit()
                    
def save_high_score(score):
    try:
        with open('high_score.json', 'r') as file:
            data = json.load(file)
            high_scores = data.get('scores', [])
            high_scores.append(score)
            high_scores.sort(reverse=True)
            data['scores'] = high_scores[:10]  # Keep only the top 10 scores
            with open('high_score.json', 'w') as write_file:
                json.dump(data, write_file)
    except FileNotFoundError:
        data = {'scores': [score]}
        with open('high_score.json', 'w') as write_file:
            json.dump(data, write_file)
            
def load_high_scores():
    try:
        with open('high_score.json', 'r') as file:
            data = json.load(file)
            return data.get('scores', [])
    except FileNotFoundError:
        return []
    


# Initialize Pygame
pygame.init()

# Set up screen
screen = pygame.display.set_mode((800, 400))
pygame.display.set_caption('Barrel Jump')
clock = pygame.time.Clock()
test_font = pygame.font.Font('Mygame/font/Pixeltype.ttf', 50)

# Load game resources
bg_music = pygame.mixer.Sound('Mygame/Sounds/background.mp3')
bg_music.set_volume(0.5)
bg_music.play(loops=-1)

# Groups
player_group = pygame.sprite.GroupSingle()
player_group.add(Player())

obstacle_group = pygame.sprite.Group()

sky_surface = load_image('Mygame/background/Sky.jpg')
ground_surface = load_image('Mygame/background/ground.png')

# Intro screen
player_stand = load_image('Mygame/Player/player_stand.png')
player_stand = pygame.transform.rotozoom(player_stand, 0, 0)
player_stand_rect = player_stand.get_rect(midleft=(50, 200))

game_name = test_font.render('Barrel Jump', False, 'Black')
game_name_rect = game_name.get_rect(center=(400, 60))

game_message = test_font.render('Press Play', False, 'Black')
game_message_rect = game_message.get_rect(center=(400, 340))

# Menu screen
menu_options = ['Play', 'Sound', 'High Scores', 'Exit']
menu_index = 0
menu_font = pygame.font.Font(None, 36)
small_font = pygame.font.Font(None, 24)
sound_status = "On"
sound_text = small_font.render(f"Sound: {sound_status}", True, (255, 255, 255))
sound_rect = sound_text.get_rect(topright=(780, 10))

# Set up obstacle timer
obstacle_timer = pygame.USEREVENT + 1
pygame.time.set_timer(obstacle_timer, 1500)  # Adjust the interval as needed (in milliseconds)

# Game loop
game_active = False
game_restart = False
show_high_score_screen = False
start_time = 0
score = 0

while True:
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            pygame.quit()
            sys.exit()

        if not game_active and not show_high_score_screen:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    menu_index = (menu_index - 1) % len(menu_options)
                elif event.key == pygame.K_DOWN:
                    menu_index = (menu_index + 1) % len(menu_options)
                elif event.key == pygame.K_RETURN:
                    if menu_options[menu_index] == 'Play':
                        game_active = True
                        start_time = int(pygame.time.get_ticks() / 1000)
                    elif menu_options[menu_index] == 'Sound':
                        bg_music.set_volume(1.0 - bg_music.get_volume())
                        sound_status = "On" if bg_music.get_volume() > 0 else "Off"
                        sound_text = small_font.render(f"Sound: {sound_status}", True, (255, 255, 255))
                    elif menu_options[menu_index] == 'High Scores':
                        # Add code to display high scores screen
                        pass
                    elif menu_options[menu_index] == 'Exit':
                        pygame.quit()
                        sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                for i, option in enumerate(menu_options):
                    text_rect = menu_font.render(option, True, (0, 0, 0)).get_rect(center=(400, 200 + i * 50))
                    if text_rect.collidepoint(mouse_pos):
                        if option == 'Play':
                            game_active = True
                            start_time = int(pygame.time.get_ticks() / 1000)
                        elif option == 'Sound':
                            bg_music.set_volume(1.0 - bg_music.get_volume())
                            sound_status = "On" if bg_music.get_volume() > 0 else "Off"
                            sound_text = small_font.render(f"Sound: {sound_status}", True, (255, 255, 255))
                        elif option == 'High Scores':
                            # Add code to display high scores screen
                            pass
                        elif option == 'Exit':
                            pygame.quit()
                            sys.exit()
            elif event.type == pygame.MOUSEMOTION:
                mouse_pos = pygame.mouse.get_pos()
                for i, option in enumerate(menu_options):
                    text_rect = menu_font.render(option, True, (0, 0, 0)).get_rect(center=(400, 135 + i * 65))
                    if text_rect.collidepoint(mouse_pos):
                        menu_index = i

        if game_active:
            if event.type == obstacle_timer:
                obstacle_group.add(Obstacle(choice(['fly', 'fly', 'snail1', 'snail2'])))

    if game_active:
        screen.blit(sky_surface, (0, 0))
        screen.blit(ground_surface, (0, 300))

        score = display_score(start_time)

        player_group.update()
        obstacle_group.update()

        player_group.draw(screen)
        obstacle_group.draw(screen)

        if player_group.sprite and any(player_group.sprite.rect.colliderect(obstacle.rect) for obstacle in obstacle_group):
            game_active = False
            game_restart = True
            show_high_score_screen = True
            obstacle_group.empty()  # Reset obstacles

    elif show_high_score_screen:
        # Display the high score screen
        if high_score_screen(screen, score):
            # If the player chooses to play again, reset the game
            show_high_score_screen = False
            game_active = True
            start_time = int(pygame.time.get_ticks() / 1000)
            score = 0
        else:
            # If the player chooses to exit, exit the game
            pygame.quit()
            sys.exit()

    else:
        screen.fill((166, 89, 89))
        screen.blit(player_stand, player_stand_rect)

        if player_group.sprite:
            player_group.sprite.gravity = 0
            # player_group.draw(screen)

        score_message = test_font.render(f'Your score: {score}', False, 'Black')
        score_message_rect = score_message.get_rect(center=(400, 330))
        screen.blit(game_name, game_name_rect)

        if score == 0 or game_restart:
            screen.blit(game_message, game_message_rect)
        else:
            screen.blit(score_message, score_message_rect)

        for i, option in enumerate(menu_options):
            color = (0, 0, 0) if i == menu_index else (128, 208, 128)
            text = menu_font.render(option, True, color)
            text_rect = text.get_rect(center=(400, 135 + i * 65))
            screen.blit(text, text_rect)

        screen.blit(sound_text, sound_rect)

    pygame.display.update()
    clock.tick(60)
