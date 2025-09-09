<?php

declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static Aws()
 * @method static static Digitalocean()
 * @method static static Vultr()
 * @method static static Other()
 */
final class Providers extends Enum
{
    const Aws = 'aws';

    const Digitalocean = 'digitalocean';

    const Vultr = 'vultr';
    const Other = 'other';
}
