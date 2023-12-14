import sys
import json
from random import randint, choice
import pygame
from enum import Enum

class GameState(Enum):
    MENU = 0
    PLAYING = 1
    HIGH_SCORES = 2
    HIGH_SCORE_INPUT = 3
    HANDLE_HIGH_SCORE_INPUT = 4
    DISPLAY_HIGH_SCORES_SCREEN = 5


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

def display_high_scores_screen(screen):
    screen.fill((194, 178, 128))# Set the background color

    high_scores_list = load_high_scores()
    high_scores_list.sort(reverse=True, key=lambda x: x['score'])
    high_score_font = pygame.font.Font('Mygame/font/Pixeltype.ttf', 55)

    title_text = high_score_font.render('Top 10 High Scores:', True, (0, 0, 0))
    screen.blit(title_text, (500 - title_text.get_width() // 1, 35))
    
    # image backgrounds
    player_stand = load_image('Mygame/Player/player_stand.png')
    player_stand = pygame.transform.scale(player_stand, (player_stand.get_width() * 1.5, player_stand.get_height() * 1.5))
    hay = load_image('Mygame/Fly/Fly2.png')
    hay = pygame.transform.scale(hay, (hay.get_width() * 1, hay.get_height() * 1))
    barrel = load_image('Mygame/snail/snail1.png')
    barrel = pygame.transform.scale(barrel, (barrel.get_width() * 1.2, barrel.get_height() * 1.2))
    # print on screen
    screen.blit(player_stand, (85, 190))
    
    back_button_text = menu_font.render('Back', True, (2, 20, 3))
    back_button_rect = back_button_text.get_rect(center=(60, 30))
    screen.blit(back_button_text, back_button_rect)

    for i, hs in enumerate(high_scores_list[:10]):
        hs_text = high_score_font.render(f"{i + 1}. {hs['name']}: {hs['score']}", True, (0, 0, 0))
        screen.blit(hs_text, (550 - hs_text.get_width() // 93, 40 + i * 35))

    pygame.display.update()
    
def handle_high_score_input(screen, final_score):
    player_name = ""
    score = final_score
    input_active = True

    while True:
        mouse_pos = pygame.mouse.get_pos()

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                pygame.quit()
                sys.exit()
            elif event.type == pygame.KEYDOWN:
                if event.key == pygame.K_RETURN:
                    save_high_score(player_name, final_score)
                    return GameState.MENU  # Go back to the main menu
                elif event.key == pygame.K_BACKSPACE:
                    player_name = player_name[:-1]
                else:
                    player_name += event.unicode
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                play_again_rect = pygame.Rect(100, 250, 200, 50)
                exit_rect = pygame.Rect(500, 250, 200, 50)

                if play_again_rect.collidepoint(mouse_pos):
                    save_high_score(player_name, final_score)
                    return GameState.MENU  # Restart the game

            elif exit_rect.collidepoint(mouse_pos):
                pygame.quit()
                sys.exit()

        screen.blit(sky_surface, (0, 0))  # Set the background color
        high_score_font = pygame.font.Font(None, 36)

        # Display the final score
        score_message = high_score_font.render(f'Your Final Score: {score}', True, (0, 0, 0))
        score_rect = score_message.get_rect(center=(400, 150))
        screen.blit(score_message, score_rect)

        # Display "Play Again" and "Exit" buttons
        play_again_text = high_score_font.render('Menu', True, (194, 178, 128))
        play_again_rect = play_again_text.get_rect(center=(100, 275))
        screen.blit(play_again_text, play_again_rect)

        exit_text = high_score_font.render('Exit', True, (194, 178, 128))
        exit_rect = exit_text.get_rect(center=(600, 275))
        screen.blit(exit_text, exit_rect)

        # Display player input for name
        input_rect = pygame.Rect(300, 200, 200, 40)
        pygame.draw.rect(screen, (255, 255, 255), input_rect)
        pygame.draw.rect(screen, (0, 0, 0), input_rect, 2)
        input_text = high_score_font.render(player_name, True, (0, 0, 0))
        screen.blit(input_text, input_rect.move(10, 5))  # Adjust the x-coordinate from 1 to 10

        pygame.display.update()

def save_high_score(player_name, score):
    try:
        with open('high_score.json', 'r') as file:
            data = json.load(file)
            high_scores = data.get('high_scores', [])
            high_scores.append({'name': player_name, 'score': score})
            high_scores.sort(reverse=True, key=lambda x: x['score'])
            data['high_scores'] = high_scores[:10]  # Keep only the top 10 scores
            with open('high_score.json', 'w') as write_file:
                json.dump(data, write_file)
    except FileNotFoundError:
        data = {'high_scores': [{'name': player_name, 'score': score}]}
        with open('high_score.json', 'w') as write_file:
            json.dump(data, write_file)

def load_high_scores():
    try:
        with open('high_score.json', 'r') as file:
            data = json.load(file)
            return data.get('high_scores', [])
    except FileNotFoundError:
        return []

pygame.init()

screen = pygame.display.set_mode((800, 400))
pygame.display.set_caption('Barrel Jump')
clock = pygame.time.Clock()
test_font = pygame.font.Font('Mygame/font/Pixeltype.ttf', 50)

bg_music = pygame.mixer.Sound('Mygame/Sounds/background.mp3')
bg_music.set_volume(0.5)
bg_music.play(loops=-1)

player_group = pygame.sprite.GroupSingle()
player_group.add(Player())

obstacle_group = pygame.sprite.Group()

sky_surface = load_image('Mygame/background/Sky.jpg')
ground_surface = load_image('Mygame/background/ground.png')

player_stand = load_image('Mygame/Player/player_stand.png')
player_stand = pygame.transform.rotozoom(player_stand, 0, 0)
player_stand_rect = player_stand.get_rect(midleft=(50, 200))

game_name = test_font.render('Barrel Jump', False, 'Black')
game_name_rect = game_name.get_rect(center=(400, 60))

game_message = test_font.render('', False, 'Black')
game_message_rect = game_message.get_rect(center=(400, 340))

menu_options = ['Play', 'Sound', 'High Scores', 'Exit']
menu_index = 0
menu_font = pygame.font.Font('Mygame/font/Pixeltype.ttf', 47)
small_font = pygame.font.Font(None, 24)
sound_status = "On"
sound_text = small_font.render(f"Sound: {sound_status}", True, (255, 255, 255))
sound_rect = sound_text.get_rect(topright=(780, 10))

obstacle_timer = pygame.USEREVENT + 1
pygame.time.set_timer(obstacle_timer, 1500)

game_state = GameState.MENU
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

        elif game_state == GameState.MENU:
            if event.type == pygame.KEYDOWN:
                if event.key == pygame.K_UP:
                    menu_index = (menu_index - 1) % len(menu_options)
                elif event.key == pygame.K_DOWN:
                    menu_index = (menu_index + 1) % len(menu_options)
                elif event.key == pygame.K_RETURN:
                    if menu_options[menu_index] == 'Play':
                        game_state = GameState.PLAYING
                        start_time = int(pygame.time.get_ticks() / 1000)
                    elif menu_options[menu_index] == 'Sound':
                        bg_music.set_volume(1.0 - bg_music.get_volume())
                        sound_status = "On" if bg_music.get_volume() > 0 else "Off"
                        sound_text = small_font.render(f"Sound: {sound_status}", True, (255, 255, 255))
                    elif menu_options[menu_index] == 'High Scores':
                        game_state = GameState.DISPLAY_HIGH_SCORES_SCREEN  # Fixed this line
                    elif menu_options[menu_index] == 'Exit':
                        pygame.quit()
                        sys.exit()
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                for i, option in enumerate(menu_options):
                    text_rect = menu_font.render(option, True, (0, 0, 0)).get_rect(center=(400, 135 + i * 65))
                    if text_rect.collidepoint(mouse_pos):
                        if option == 'Play':
                            game_state = GameState.PLAYING
                            start_time = int(pygame.time.get_ticks() / 1000)
                        elif option == 'Sound':
                            bg_music.set_volume(1.0 - bg_music.get_volume())
                            sound_status = "On" if bg_music.get_volume() > 0 else "Off"
                            sound_text = small_font.render(f"Sound: {sound_status}", True, (255, 255, 255))
                        elif option == 'High Scores':
                            game_state = GameState.HIGH_SCORES
                            display_high_scores_screen(screen)  # Fixed this line
                        elif option == 'Exit':
                            pygame.quit()
                            sys.exit()
            elif event.type == pygame.MOUSEMOTION:
                mouse_pos = pygame.mouse.get_pos()
                for i, option in enumerate(menu_options):
                    text_rect = menu_font.render(option, True, (0, 0, 0)).get_rect(center=(400, 135 + i * 65))
                    if text_rect.collidepoint(mouse_pos):
                        menu_index = i

        elif game_state == GameState.PLAYING:
            if event.type == obstacle_timer:
                obstacle_group.add(Obstacle(choice(['fly', 'fly', 'snail1', 'snail2'])))

        elif game_state == GameState.HIGH_SCORES:
            if event.type == pygame.KEYDOWN:      
                if event.key == pygame.K_RETURN:
                    screen.blit(sky_surface, (0, 0))
                    display_high_scores_screen(screen)
                    back_button_text = menu_font.render('Back', True, (2, 20, 3))
                    back_button_rect = back_button_text.get_rect(center=(60, 30))
                    screen.blit(back_button_text, back_button_rect)
                    option = 'back'
                    game_state = GameState.MENU
                    # high scores screen
            elif event.type == pygame.MOUSEBUTTONDOWN:
                mouse_pos = pygame.mouse.get_pos()
                display_high_scores_screen(screen)
                back_button_text = menu_font.render('Back', True, (2, 20, 3))
                back_button_rect = back_button_text.get_rect(center=(60, 30))
                screen.blit(back_button_text, back_button_rect)
                if back_button_rect.collidepoint(mouse_pos):
                    game_state = GameState.MENU


    if game_state == GameState.MENU:
        screen.blit(sky_surface, (0, 0))
        screen.blit(ground_surface, (0, 300))
        screen.blit(player_stand, player_stand_rect)
        screen.blit(game_name, game_name_rect)

        if score == 0 or game_restart:
            screen.blit(game_message, game_message_rect)
            
        for i, option in enumerate(menu_options):
            color = (194, 178, 128) if i == menu_index else (0, 0, 0)
            text = menu_font.render(option, True, color)
            text_rect = text.get_rect(center=(400, 135 + i * 65))
            screen.blit(text, text_rect)
            screen.blit(sound_text, sound_rect)

    elif game_state == GameState.PLAYING:
        screen.blit(sky_surface, (0, 0))
        screen.blit(ground_surface, (0, 300))

        score = display_score(start_time)

        obstacle_group.update()  # Move this line up

        player_group.update()

        player_group.draw(screen)
        obstacle_group.draw(screen)
        collided_obstacles = pygame.sprite.spritecollide(player_group.sprite, obstacle_group, False)

        if game_state == GameState.PLAYING:
            if pygame.sprite.spritecollide(player_group.sprite, obstacle_group, False):
                game_state = GameState.HIGH_SCORE_INPUT
                game_active = False
                show_high_score_screen = True
                obstacle_group.empty()

    elif game_state == GameState.HIGH_SCORE_INPUT:
        game_state = handle_high_score_input(screen, score)
        option = 'back'
        
    pygame.display.update()
    clock.tick(60)      
