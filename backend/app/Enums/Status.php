<?php

declare(strict_types=1);

namespace App\Enums;

use BenSampo\Enum\Enum;

/**
 * @method static static Active()
 * @method static static Inactive()
 * @method static static Maintenance()
 */
final class Status extends Enum
{
    const Active = 'active';

    const Inactive = 'inactive';

    const Maintenance = 'maintenance';
}
